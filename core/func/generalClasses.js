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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A bunch of general purpose utility classes 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <generalDesignClasses.js>

var isLean;
var defaultTransitionControl = false;

initGlobalDefaults.generalDebug = {
    inViewIsTrue: false,
    inViewIndexBased: false
}

initGlobalDefaults.general = {
    toggleUXWidth: 26,
    toggleUXHeight: 14,
    toggleHorizontalSpacingBetweenElements: { "V1": 10, "V2": 10, "V3": 10 },
    showReloadAppDialog: false
};

var functionID = {
    // note that the percent function actually translates to a functionID.sum with a percent display mode
    // since the only function for which the percent mode applies is the sum function, we can force it into
    // the list of measure functions, and thus spare the user a third dimension on top of measureFacet and measureFunction
    percent: 0,
    sum: 1,
    count: 2,
    avg: 3,
    median: 4,
    min: 5,
    max: 6,
    topQuartile: 7,
    bottomQuartile: 8,
    topDecile: 9,
    bottomDecile: 10,
    stddev: 11
};

// this is the constant that represents selecting (count) in the measure facet: the *additional* option available there when we select Percent in the
// percent (distribution) function. it is additional to the list of numerical facets available there.
// note this is not synonymous with saying the measure facet is the hosting facet itself:
// one could, for example, look in a Sales facet at the *average Sales*, as a measure per sales range - that would be displayed on top of a histogram 
// which divides sales into several bins, and it would display the average for each such bin. so the "host" facet, if it is numerical, is a valid measureFacet, 
// and not to be confused with the display of the facet's count/unit distribution.
var measureFacetCountDistribution = "___measureFacetCountDistribution___";

var classes = {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class should be inherited by an application's screen area.
    // It inherits:
    // IconEmbedding: IconEmbedding functions as the referredOf of any Icon created. It embeds these icons, thus allowing them to exceed the boundaries of their expressionOf.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ScreenArea: {
        "class": o("GeneralArea", "ManualClock"),
        position: {
            frame: 0
        },
        children: {
            visualDebugger: {
                description: {
                    "class": compileVD ? "VisualDebugger" : o()
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The application area must inherit this class, and the screenArea area should inherit ScreenArea.
    // App stores the operationInProgress context label in order to allow areas throughout to know whether the application is in the midst of an operation, in order to calculates
    // their own inFocus flag.
    //
    // This class inherits: 
    // 1. ZTop so that it has a "zTop" z-label (which is by default above all embeddedStar areas). Given this label, we can position icons and such above it, when they are to be on top of 
    //    all other areas.
    // 2. TrackModalDialog: to know whether a modal dialog exists - if so, this class embeds ModalDialogScreen, an App-wide semi-opaque screen between the modal dialog and the entire 
    //    application (see documentation there). 
    // 
    // API: 
    // 1. iconEmbedding: this class defines am areaRef in which icons will be embedded. default value: App.
    // 2. name: the name of the app, to be displayed if need be.
    // 3. defaultCurrentView: Inheriting class may override. o(), by default.
    // 4. createReloadAppDialogable: a boolean indicating whether a Reload App button will appear if a new revision is present on the server.
    //    true, by default.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    App: o(
        { // variant-controller
            qualifier: "!",
            context: {
                fileDraggedOverMe: [{ dragging: { kind: "file" } }, [pointer]],
                pointerWithinBrowser: [overlap, [areaOfClass, "ScreenArea"], [pointer]],
                operationInProgress: [{ myOperationInProgress: _ }, [areaOfClass, "Operationable"]],
                createReloadAppDialogable: true
            }
        },
        { // default
            "class": o(
                "AppDesign",
                "AppStrings",
                "GeneralArea",
                "PointerArea",
                "Tkdable",
                "ZTop",
                "Clipboard",
                "DateFormat",
                "TrackModalDialog"
            ),
            context: {
                language: "english",
                iconEmbedding: [me],
                defaultInAreaDelay: 1, // seconds


                transitionControl: [arg, "transition", defaultTransitionControl],
                name: "<insert app name here>",

                "^showPostIt": false,
                altShiftKey: "P", // OnAltShiftKey param

                abTestsController: [{ children: { abTestsController: _ } }, [me]],
                saveViewController: [{ children: { saveViewController: _ } }, [me]],
                defaultCurrentView: o(),
                currentView: [{ saveViewController: { currentView: _ } }, [me]],
                displayDensity: [mergeWrite,
                    [{ currentView: { displayDensity: _ } }, [me]],
                    "V2" // default value
                ],
                appStateRemotingState: [tempAppStateConnectionInfo],
                appStateRemotingServerAddress: [{ appStateRemotingState: { serverAddress: _ } }, [me]],
                appStateRemotingErrorId: [{ appStateRemotingState: { errorId: _ } }, [me]],
                appStateRemotingConnectionAlive: [equal, [{ appStateRemotingErrorId: _ }, [me]], 0],
                appStateConnectionState: [{ appStateRemotingState: { connectionState: _ } }, [me]],

                operationInProgressArea: [{ myOperationInProgress: true }, [areaOfClass, "Operationable"]],
                tmd: [{ tmd: _ }, [areaOfClass, "Tmdable"]],
                dragging: [{ draggingFlag: _ }, [areaOfClass, "DragHandle"]]
            },
            write: {
                onFSAppAltShiftP: {
                    "class": "OnAltShiftKey",
                    true: {
                        toggleShowPostIt: {
                            to: [{ showPostIt: _ }, [me]],
                            merge: [not, [{ showPostIt: _ }, [me]]]
                        }
                    }
                }
            },
            children: {
                abTestsController: {
                    description: {
                        "class": "ABTestsController"
                    }
                },
                saveViewController: {
                    description: {
                        "class": "SaveViewController"
                    }
                }
            }
        },
        {
            qualifier: { createReloadAppDialogable: true },
            children: {
                reloadAppDialogable: {
                    description: {
                        "class": "ReloadAppDialogable"
                    }
                }
            }
        },
        {
            qualifier: { modalDialogOn: true },
            children: {
                modalDialogScreen: {
                    description: {
                        "class": "ModalDialogScreen"
                    }
                }
            }
        },
        {
            qualifier: { showPostIt: true },
            children: {
                postIt: {
                    description: {
                        "class": "PostIt"
                    }
                }
            }
        },
        {
            qualifier: { showSavedViewDebug: true },
            children: {
                savedViews: {
                    description: {
                        "class": "DebugSavedViews"
                    }
                },
                currentView: {
                    description: {
                        "class": "DebugCurrentView"
                    }
                }
            }
        },
        {
            qualifier: { operationInProgress: true },
            write: {
                onAppExitBrowser: {
                    upon: [not, [{ pointerWithinBrowser: _ }, [me]]],
                    true: {
                        turnOffOperationInProgress: {
                            to: [{ operationInProgressArea: { myOperationInProgress: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ReloadAppDialogable: o(
        { // variant controller
            qualifier: "!",
            context: {
                createModalDialog: o(
                    [{ general: { showReloadAppDialog: _ } }, [globalDefaults]],
                    [o(2, 3), [{ myApp: { appStateRemotingErrorId: _ } }, [me]]]
                ),
                remotingErrorMsg: [
                    cond, [{ myApp: { appStateRemotingErrorId: _ } }, [me]],
                    o({
                        on: 2, use: "New Application Version Available"
                    }, {
                        on: null, use: "An error has occurred"
                    })
                ]
            },
        },
        { // default
            "class": "ModalDialogable",
            position: {
                // needs to have a minimal size so that it can create an intersection with the IconEmbedding area (ScreenArea)
                top: 0,
                left: 0,
                width: 1,
                height: 1
            },
            write: {
                onPressReloadButton: {
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        reloadApp: {
                            to: [redirect],
                            merge: [{ url: _ }, [systemInfo]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { createModalDialog: true },
            children: {
                modalDialog: {
                    //partner: default myApp defined in ModalDialog
                    description: {
                        "class": "ReloadAppDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    ReloadAppDialog: {
        "class": "ModalDialog",
        children: {
            textDisplay: {
                description: {
                    "class": "OKCancelDialogText",
                    context: {
                        displayText: [{remotingErrorMsg: _}, [expressionOf, [embedding]]],
                        padding: 0 // override default from OKCancelDialogText
                    }
                }
            },
            okControl: {
                description: {
                    "class": "OKCancelDialogOKControl",
                    context: {
                        displayText: "Reload"
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Clipboard: {
        context: {
            "^clipboard": o()
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateFormat: {
        context: {
            defaultDateFormat: "dd/MM/yyyy",
            defaultAbridgedDateFormat: "dd/MM/yy"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppStrings: {
        context: {
            companyNameStr: "Mondria Technologies Ltd.",
            aboutStr: "About",
            printStr: "Print…",
            downloadStr: "Save Image As…",
            copyrightStr: "Copyright ©",
            versionStr: "Version",
            licenseInformationForStr: "License Information for",
            fullCopyrightStr: [concatStr,
                o(
                    [{ copyrightStr: _ }, [me]],
                    //"&#169", awaiting theo's response how to get the copyright symbol
                    "2017",
                    [{ companyNameStr: _ }, [me]]
                ),
                " "
            ],
            termsOfUseStr: "The use of this product is subject to Mondria's End User Agreement, unless otherwise specified therein.",
            dataSourceAttributionTitleStr: "Data Provider",
            openSourceTitleStr: "Use of Open-Source Libraries",
            openSourceTextStr: "This product also includes the following libraries which are covered  by the GNU LGPL license:",
            listOfOpenSources: o(), // add bowser, a browser detector, by dustin diaz

            standardEnglishPluralization: [defun,
                o("singular"),
                [concatStr, o("singular", "s")]
            ],

            appEntityStr: "Application",
            appEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ appEntityStr: _ }, [me]]
            ],
            dataSourceEntityStr: "Database",
            dataSourceEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ dataSourceEntityStr: _ }, [me]]
            ],
            fileEntityStr: "File",
            fileEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ fileEntityStr: _ }, [me]]
            ],
            nameEntityStr: "Name",
            nameEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ nameEntityStr: _ }, [me]]
            ],
            paneEntityStr: "Pane",
            paneEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ paneEntityStr: _ }, [me]]
            ],
            viewEntityStr: "View",
            viewEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ viewEntityStr: _ }, [me]]
            ],
            rowEntityStr: "Row",
            rowEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ rowEntityStr: _ }, [me]]
            ],
            columnEntityStr: "Column",
            columnEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ columnEntityStr: _ }, [me]]
            ],
            optionEntityStr: "Option",
            optionEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ optionEntityStr: _ }, [me]]
            ],
            settingEntityStr: "Setting",
            settingEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ settingEntityStr: _ }, [me]]
            ],
            formulaEntityStr: "Formula",
            formulaEntityStrPlural: "Formulae",
            itemEntityStr: "Item",
            itemEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ itemEntityStr: _ }, [me]]
            ],
            valueEntityStr: "Value",
            valueEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ valueEntityStr: _ }, [me]]
            ],
            selectorEntityStr: "Selector",
            selectorEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ selectorEntityStr: _ }, [me]]
            ],
            selectionEntityStr: "Selection",
            selectionEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ selectionEntityStr: _ }, [me]]
            ],
            tagEntityStr: "Tag",
            tagEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ tagEntityStr: _ }, [me]]
            ],
            controllerEntityStr: "Controller",
            controllerEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ controllerEntityStr: _ }, [me]]
            ],
            statisticEntityStr: "Statistic",
            statisticEntityStrPlural: "Statistics",
            frameEntityStr: "Frame",
            frameEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ frameEntityStr: _ }, [me]]
            ],
            histogramEntityStr: "Histogram",
            histogramEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ histogramEntityStr: _ }, [me]]
            ],
            binEntityStr: "Bin",
            binEntityStrPlural: [
                [{ standardEnglishPluralization: _ }, [me]],
                [{ binEntityStr: _ }, [me]]
            ],
            unitStr: "Unit",
            linearStr: "Linear",
            logStr: "Logarithmic",
            scaleStr: "Scale",
            numberStr: "Number",
            numericalStr: "Numerical",
            frequencyStr: "Frequency",
            functionStr: "Function",

            percentStr: { long: "Percent", short: "Percent" },
            sumStr: { long: "Sum", short: "Sum" },
            countStr: { long: "Count", short: "Count" },
            avgStr: { long: "Average", short: "Avg." },
            medianStr: { long: "Median", short: "Median" },
            stddevStr: { long: "Standard Deviation", short: "StD" },
            maxStr: { long: "Maximum", short: "Max" },
            minStr: { long: "Minimum", short: "Min" },
            absStr: { long: "Absolute Value", short: "Abs" },
            topQuartileStr: { long: "Top Quartile", short: "75%" },
            bottomQuartileStr: { long: "Bottom Quartile", short: "25%" },
            topDecileStr: { long: "Top Decile", short: "90%" },
            bottomDecileStr: { long: "Bottom Decile", short: "10%" },
            positiveStr: "Positive",
            negativeStr: "Negative",
            measureFacetCountDistributionStr: "count",

            aStr: "a",
            asStr: "as",
            isStr: "is",
            andStr: "and",
            fromStr: "from",
            byStr: "by",
            ofStr: "of",
            onStr: "on",
            toStr: "to",
            theStr: "the",
            capitalizedTheStr: "The",
            perStr: "per",
            inStr: "in",
            itStr: "It",
            withStr: "with",
            usedStr: "used",
            onBothEndsStr: "on Both Ends",
            permanentlyStr: "Permanently",
            allStr: "All",
            membershipStr: "Membership",
            nameStr: "Name",
            beforeStr: "Before",
            afterStr: "After",
            otherStr: "Other",

            nextStr: "Next",
            prevStr: "Previous",
            timeFrameStr: "Time Frame",

            noValueStr: "No Value",
            unratedStr: "Unrated",

            definitionStr: "Definition",
            clickStr: "Click",
            clickOnAStr: "Click on a",
            editStr: "Edit",
            searchStr: "Search",
            clearStr: "Clear",
            setStr: "Set",
            resetStr: "Reset",
            savedStr: "Saved",
            enabledStr: "Enabled",
            disabledStr: "Disabled",
            exploreStr: "Explore",
            populateStr: "Populate",
            exportStr: "Export",
            exportedStr: "Exported",
            importStr: "Import",
            updateStr: "Update",
            expandStr: "Expand",
            minimizeStr: "Minimize",
            minimizedStr: "Minimized",
            showStr: "Show",
            hideStr: "Hide",
            openStr: "Open",
            closeStr: "Close",
            enableStr: "Enable",
            disableStr: "Disable",
            includeStr: "Include",
            excludeStr: "Exclude",
            selectStr: "Select",
            dragStr: "Drag",
            addStr: "Add",
            newStr: "New",
            saveStr: "Save",
            moreStr: "More",
            lessStr: "Less",
            duplicateStr: "Duplicate",
            trashStr: "Trash",
            deleteStr: "Delete",
            sortStr: "Sort",
            sortedStr: "Sorted",
            sortingStr: "Sorting",
            refreshStr: "Refresh",
            alphabeticallyStr: "Alphabetically",
            ascendingStr: "Ascending",
            descendingStr: "Descending",
            increaseStr: "Increase",
            decreaseStr: "Decrease",
            searchBoxStr: "Search Box",
            dataStr: "Data",
            resolutionStr: "Resolution",

            refreshDataStr: [concatStr,
                o(
                    [{ refreshStr: _ }, [me]],
                    [{ dataStr: _ }, [me]]
                ),
                " "
            ],

            currentStr: "Current",
            previousStr: "Previous",

            functionNameStrFunc: [defun,
                o(
                    "funcID", // see functionID 
                    "version" // "short"/"intermediate"/"long"
                ),
                [using,
                    "funcNameObj",
                    [cond,
                        "funcID",
                        o(
                            {
                                on: functionID.percent,
                                use: [{ percentStr: _ }, [me]]
                            },
                            {
                                on: functionID.avg,
                                use: [{ avgStr: _ }, [me]]
                            },
                            {
                                on: functionID.sum,
                                use: [{ sumStr: _ }, [me]]
                            },
                            {
                                on: functionID.median,
                                use: [{ medianStr: _ }, [me]]
                            },
                            {
                                on: functionID.count,
                                use: [{ countStr: _ }, [me]]
                            },
                            {
                                on: functionID.min,
                                use: [{ minStr: _ }, [me]]
                            },
                            {
                                on: functionID.max,
                                use: [{ maxStr: _ }, [me]]
                            },
                            {
                                on: functionID.topQuartile,
                                use: [{ topQuartileStr: _ }, [me]]
                            },
                            {
                                on: functionID.bottomQuartile,
                                use: [{ bottomQuartileStr: _ }, [me]]
                            },
                            {
                                on: functionID.topDecile,
                                use: [{ topDecileStr: _ }, [me]]
                            },
                            {
                                on: functionID.bottomDecile,
                                use: [{ bottomDecileStr: _ }, [me]]
                            },
                            {
                                on: functionID.stddev,
                                use: [{ stddevStr: _ }, [me]]
                            }
                        )
                    ],
                    [cond,
                        "version",
                        o(
                            {
                                on: "long",
                                use: [{ long: _ }, "funcNameObj"]
                            },
                            {
                                on: "intermediate",
                                use: [{ intermediate: _ }, "funcNameObj"]
                            },
                            {
                                on: "short",
                                use: [{ short: _ }, "funcNameObj"]
                            }
                        )
                    ]
                ]
            ],
            booleanStringFunc: [defun,
                o("actionMetaphor", "prefixString", "suffixString", "booleanFlag"),
                [booleanStringFunc, // a global func
                    "prefixString",
                    "suffixString",
                    [cond,
                        "actionMetaphor",
                        o(
                            { on: actionConst.showHide, use: [{ showStr: _ }, [me]] },
                            { on: actionConst.expandMinimize, use: [{ expandStr: _ }, [me]] },
                            { on: actionConst.openClose, use: [{ openStr: _ }, [me]] },
                            { on: actionConst.enableDisable, use: [{ enableStr: _ }, [me]] },
                            { on: actionConst.includeExclude, use: [{ includeStr: _ }, [me]] },
                            { on: actionConst.showMoreLess, use: [concatStr, o([{ showStr: _ }, [me]], [{ moreStr: _ }, [me]]), " "] }
                        )
                    ],
                    [cond,
                        "actionMetaphor",
                        o(
                            { on: actionConst.showHide, use: [{ hideStr: _ }, [me]] },
                            { on: actionConst.expandMinimize, use: [{ minimizeStr: _ }, [me]] },
                            { on: actionConst.openClose, use: [{ closeStr: _ }, [me]] },
                            { on: actionConst.enableDisable, use: [{ disableStr: _ }, [me]] },
                            { on: actionConst.includeExclude, use: [{ excludeStr: _ }, [me]] },
                            { on: actionConst.showMoreLess, use: [concatStr, o([{ showStr: _ }, [me]], [{ lessStr: _ }, [me]]), " "] }
                        )
                    ],
                    "booleanFlag"
                ]
            ],

            trashDialogBoxConfirmationTextGenerator: [defun,
                o("name", "entity"),
                [concatStr,
                    o(
                        [{ trashStr: _ }, [me]],
                        " ",
                        [{ theStr: _ }, [me]],
                        " ",
                        "name",
                        " ",
                        "entity",
                        "?"
                    )
                ]
            ],
            placeholderInputTextGenerator: [defun,
                o("entity"),
                [concatStr,
                    o(
                        "<",
                        "entity",
                        " ",
                        [{ nameEntityStr: _ }, [me]],
                        ">"
                    )
                ]
            ],
            inputTextAlreadyBeingUsedMsgGenerator: [defun,
                o("entity"),
                [concatStr,
                    o(
                        "entity",
                        " Name is Already in Use"
                    )
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackAppStateRemoting: o(
        { // variant-controller
            qualifier: "!",
            context: {
                appStateRemotingServerAddress: [{ myApp: { appStateRemotingServerAddress: _ } }, [me]],
                appStateRemotingErrorId: [{ myApp: { appStateRemotingErrorId: _ } }, [me]],
                appStateRemotingConnectionAlive: [{ myApp: { appStateRemotingConnectionAlive: _ } }, [me]],
                appStateConnectionState: [{ myApp: { appStateConnectionState: _ } }, [me]]
            }
        },
        { // default
            context: {
                appStateRemotingState: [{ myApp: { appStateRemotingState: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    LoadingScreen: {
        "class": o("LoadingScreenDesign", "ModalDialogScreen")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // To facilitate referencing.
    // API:
    // Inheriting classes should define the myOperationInProgress boolean flag.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Operationable: {
    },


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class to allow the author to simulate a clock cycle in tests. It is inherited by ScreenArea.
    // Classes that wish to monitor the clock should inherit UponManualClockTick in the relevant event handlers.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ManualClock: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^tick": false
            }
        },
        { // default
            "class": "GeneralArea",
            write: {
                onManualClockTick: {
                    upon: [{ tick: true }, [me]],
                    true: {
                        makeItTock: {
                            to: [{ tick: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. ticksPerClick: the number of manual clock ticks produced by a click on this area. default: 1.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ManualClockRunner: o(
        {
            "class": o("ManualClockRunnerDesign", "GeneralArea", "TrackManualClock"),
            context: {
                ticksPerClick: 1,
                "^tickCounter": 0,
                "^startTicking": false,

                displayText: [concatStr,
                    o(
                        "Cycle: ",
                        [{ ticksPerClick: _ }, [me]]
                    )
                ]
            },
            write: {
                onManualClockRunnerStartTicking: {
                    "class": "OnMouseClick",
                    true: {
                        startTicking: {
                            to: [{ startTicking: _ }, [me]],
                            merge: true
                        }
                    }
                },
                onManualClockRunnerNextTick: {
                    upon: [and,
                        [{ startTicking: true }, [me]],
                        [{ manualClock: { tick: false } }, [me]],
                        [lessThan,
                            [{ tickCounter: _ }, [me]],
                            [{ ticksPerClick: _ }, [me]]
                        ]
                    ],
                    true: {
                        tickManualClock: {
                            to: [{ manualClock: { tick: _ } }, [me]],
                            merge: true
                        },
                        incTickCounter: {
                            to: [{ tickCounter: _ }, [me]],
                            merge: [plus, [{ tickCounter: _ }, [me]], 1]
                        }
                    }
                },
                onManualClockRunnerResetTicking: {
                    upon: [equal,
                        [{ tickCounter: _ }, [me]],
                        [{ ticksPerClick: _ }, [me]]
                    ],
                    true: {
                        resetStartTicking: {
                            to: [{ startTicking: _ }, [me]],
                            merge: false
                        },
                        resetTickCounter: {
                            to: [{ tickCounter: _ }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Assumes a single ManualClass instance.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackManualClock: {
        context: {
            manualClock: [areaOfClass, "ManualClock"]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // To be inherited by event handlers in which action is to be taken on a manual clock tick. 
    // Assumes the inheriting class inherits TrackManualClock
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    UponManualClockTick: {
        upon: [{ manualClock: { tick: true } }]
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Z-Axis Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class sets an inheriting area to have a z-index higher than that of the App's zTop z-label (which in turn is higher than the App's embeddedStar.
    // API:
    // 1. areaAboveAppZTop: [me], by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveAppZTop: {
        "class": "GeneralArea",
        context: {
            areaAboveAppZTop: [me]
        },
        stacking: {
            aboveApp: {
                higher: [{ areaAboveAppZTop: _ }, [me]],
                lower: {
                    element: [{ myApp: _ }, [me]],
                    label: "zTop"
                },
                priority: 1 // this is higher than the default priority by which App's zTop is placed above all of its embeddedStar areas.
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inheriting class positions itself below myApp's zTop.
    // Note: I believe the only reason to use this is when a class specifies some stacking constraint, in which case it is no longer bound by default system 
    // z-constraints (e.g. we specify that a Scrollbar is above its associated view, but want it to remain below Tooltips)
    // API:
    // 1. areaBelowAppZTop: [me], by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowAppZTop: {
        "class": "GeneralArea",
        context: {
            areaBelowAppZTop: [me]
        },
        stacking: {
            aboveApp: {
                lower: [{ areaBelowAppZTop: _ }, [me]],
                higher: {
                    element: [{ myApp: _ }, [me]],
                    label: "zTop"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveMyExpressionOf: {
        stacking: {
            aboveMyExpressionOf: {
                higher: [me],
                lower: [expressionOf]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowMyExpressionOf: {
        stacking: {
            belowMyExpressionOf: {
                higher: [expressionOf],
                lower: [me]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // the label zTop is above [me] and all of my embeddedStar. Think of it as the lid of an area, which 'covers' (z-index) all of its embeddedStar.
    // areas in embeddedStar are guaranteed to be placed under this area only if they don't define other z-constraints 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZTop: o(
        {
            qualifier: "!",
            context: {
                iAmNotMyApp: [notEqual, [me], [{ myApp: _ }, [me]]]
            }
        },
        { // default
            stacking: {
                aboveMeAndMyEmbeddedStar: {
                    higher: {
                        label: "zTop"
                    },
                    lower: [me]
                }
            }
        },
        {
            qualifier: { iAmNotMyApp: true },
            stacking: {
                myZtopBelowAppZtop: { // one of those constraints that should go away once the z-module improves    
                    lower: { label: "zTop" },
                    higher: {
                        element: [{ myApp: _ }, [me]],
                        label: "zTop"
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //  API:
    //  1. zTopAreaAboveMe: area with the zTop label to be placed amove me
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowZTopOfArea: {
        stacking: {
            belowZTopOfArea: {
                higher: {
                    element: [{ zTopAreaAboveMe: _ }, [me]],
                    label: "zTop"
                },
                lower: [me]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //  API:
    //  1. zTopAreaAboveMe: area with the zTop label to be placed below me
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveZTopOfArea: {
        stacking: {
            belowZTopOfArea: {
                lower: {
                    element: [{ zTopAreaBelowMe: _ }, [me]],
                    label: "zTop"
                },
                higher: [me]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveSiblings: {
        stacking: {
            aboveSiblings: {
                higher: [me],
                lower: [embedding]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowSiblings: {
        stacking: {
            belowSiblings: {
                lower: [me],
                higher: [embedded, [embedding]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areasBelowMe: areas to be placed below the current area
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    AboveSpecifiedAreas: {
        stacking: {
            aboveSpecifiedAreas: {
                higher: [me],
                lower: [{ areasBelowMe: _ }, [me]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areasAboveMe: areas to be placed above the current area
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BelowSpecifiedAreas: {
        stacking: {
            belowSpecifiedAreas: {
                lower: [me],
                higher: [{ areasAboveMe: _ }, [me]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Z-Axis Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinusWithLowerBound: {
        context: {
            minusWithLowerBound: [defun,
                o("a", "b", "bound"),
                [cond,
                    [lessThan,
                        [minus,
                            "a",
                            "b"
                        ],
                        "bound"
                    ],
                    o(
                        { on: true, use: "bound" },
                        { on: null, use: [minus, "a", "b"] }
                    )
                ]
            ]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PlusWithUpperBound: {
        context: {
            plusWithUpperBound: [defun,
                o("a", "b", "bound"),
                [cond,
                    [greaterThan,
                        [plus,
                            "a",
                            "b"
                        ],
                        "bound"
                    ],
                    o(
                        { on: true, use: "bound" },
                        { on: null, use: [plus, "a", "b"] }
                    )
                ]
            ]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of positioning-related classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Member of AreaSet Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is a class that areas of an areaSet should inherit. Allows them for now to know whether they're the first/last in the areaSet.
    // This class will be inherited, and not MemberOfPositionedAreaOS, when the inheriting class takes upon itself to position the members of the areaSet. one such example would be the 
    // SliderScale areas, which are positioned wrt the canvas, and not wrt one another.
    // 
    // API:
    // 1. areaOS: the os of areaRefs to be positioned. if not provided, then assumed to be the areaSet that the inheriting class pertains to.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfAreaOS: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // once [first] or [first, [me]] (and [last] too), i can rely on those, instead of looking at prev/next.
                firstInAreaOS: [cond,
                    [{ areaOS: _ }, [me]],
                    o(
                        { on: true, use: [equal, [me], [first, [{ areaOS: _ }, [me]]]] },
                        { on: false, use: [not, [prev, [me]]] }
                    )
                ],
                lastInAreaOS: [cond,
                    [{ areaOS: _ }, [me]],
                    o(
                        { on: true, use: [equal, [me], [last, [{ areaOS: _ }, [me]]]] },
                        { on: false, use: [not, [next, [me]]] }
                    )
                ],
                myPrevInAreaOS: [cond,
                    [{ areaOS: _ }, [me]],
                    o(
                        { on: true, use: [prev, [{ areaOS: _ }, [me]], [me]] },
                        { on: false, use: [prev, [me]] }
                    )
                ],
                myNextInAreaOS: [cond,
                    [{ areaOS: _ }, [me]],
                    o(
                        { on: true, use: [next, [{ areaOS: _ }, [me]], [me]] },
                        { on: false, use: [next, [me]] }
                    )
                ]
            }
        },
        { // default
            "class": "GeneralArea"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the laying out of members of an areaSet along the specified axis.
    // The axis can be specified by MemberOfVerticalAreaSet/MemberOfHorizontalAreaSet, or by other classes (typically in their axis-specific variants).
    // The areas are laid out from the lowHTML (top/left) to the highHTML (bottom/right), or vice-versa, depending on areaOSPositionedFromLowToHighHTML.
    // The axis-specific classes handle the relative positioning of these areas, but not their absolute position. That is left to the classes inheriting them.
    //
    // API:
    // 1. spacingFromPrev: 0, by default (i.e. if not provided by inheriting class)
    // 2. areaOSPositionedFromLowToHighHTML: true, by default
    // 3. myAreaOSPosPoint/myPrevInAreaOSPosPoint: default definitions provided below, depending on areaOSPositionedFromLowToHighHTML. Inheriting class may override (e.g. MovableInAS).
    // 4. MemberOfAreaOS API
    // 5. activatePositionedAreaOS: true, by default. Inheriting class may wish to deactivate in order to introduce a different constraint 
    //    (instead of relying on positioning priorities).
    // 6. useContentForAreaSetPositioning: boolean, false by default. set to true if to position the areaSet wrt the content, and not the frame
    // 7. spacingOfFirstAndLastWithRefArea: false, by default. If set to a number to impose a positioning constraint before/after the first/last element wrt to embedding area
    // 8. memberOfPositionedAreaOSReferenceArea: embedding, by default, used for setting positioning constraints
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfPositionedAreaOS: o(
        { // variant-controller
            qualifier: "!",
            context: {
                areaOSPositionedFromLowToHighHTML: true,
                activatePositionedAreaOS: true
            }
        },
        { // default
            "class": "MemberOfAreaOS",
            context: {
                calculatedSpacingFromPrev: [cond,
                    [{ spacingFromPrev: _ }, [me]],
                    o(
                        { on: true, use: [{ spacingFromPrev: _ }, [me]] },
                        { on: false, use: 0 }
                    )
                ],
                useContentForAreaSetPositioning: false, // i.e. by default, use frame.
                spacingOfFirstAndLastWithRefArea: o(),
                memberOfPositionedAreaOSReferenceArea: [embedding]
            }
        },
        {
            qualifier: {
                activatePositionedAreaOS: true,
                areaOSPositionedFromLowToHighHTML: true
            },
            context: {
                myAreaOSPosPoint: {
                    element: [me],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: [{ useContentForAreaSetPositioning: _ }, [me]]
                },
                myPrevInAreaOSPosPoint: {
                    element: [{ myPrevInAreaOS: _ }, [me]],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: [{ useContentForAreaSetPositioning: _ }, [me]]
                }
            },
            position: {
                areaSetRelativeSpacing: {
                    point1: [{ myPrevInAreaOSPosPoint: _ }, [me]],
                    point2: [{ myAreaOSPosPoint: _ }, [me]],
                    equals: [{ calculatedSpacingFromPrev: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                activatePositionedAreaOS: true,
                areaOSPositionedFromLowToHighHTML: false
            },
            context: {
                myAreaOSPosPoint: {
                    element: [me],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: [{ useContentForAreaSetPositioning: _ }, [me]]
                },
                myPrevInAreaOSPosPoint: {
                    element: [{ myPrevInAreaOS: _ }, [me]],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: [{ useContentForAreaSetPositioning: _ }, [me]]
                }
            },
            position: {
                areaSetRelativeSpacing: {
                    point1: [{ myAreaOSPosPoint: _ }, [me]],
                    point2: [{ myPrevInAreaOSPosPoint: _ }, [me]],
                    equals: [{ calculatedSpacingFromPrev: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                spacingOfFirstAndLastWithRefArea: true,
                firstInAreaOS: true,
            },
            position: {
                addExtraSpaceBeforeFirstElement: {
                    point1: {
                        element: [{ memberOfPositionedAreaOSReferenceArea: _ }, [me]],
                        type: [{ lowHTMLLength: _ }, [me]],
                    },
                    point2: {
                        element: [me],
                        type: [{ lowHTMLLength: _ }, [me]],
                        content: [{ useContentForAreaSetPositioning: _ }, [me]]
                    },
                    equals: [{ spacingOfFirstAndLastWithRefArea: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                spacingOfFirstAndLastWithRefArea: true,
                lastInAreaOS: true,
            },
            position: {
                addExtraSpaceAfterLastElement: {
                    point1: {
                        element: [me],
                        type: [{ highHTMLLength: _ }, [me]],
                        content: [{ useContentForAreaSetPositioning: _ }, [me]]
                    },
                    point2: {
                        element: [{ memberOfPositionedAreaOSReferenceArea: _ }, [me]],
                        type: [{ highHTMLLength: _ }, [me]],
                    },
                    equals: [{ spacingOfFirstAndLastWithRefArea: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfVerticalAreaOS: {
        "class": o("Vertical", "MemberOfPositionedAreaOS")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfTopToBottomAreaOS: {
        "class": o("MemberOfVerticalAreaOS"),
        context: {
            areaOSPositionedFromLowToHighHTML: true
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfBottomToTopAreaOS: {
        "class": o("MemberOfVerticalAreaOS"),
        context: {
            areaOSPositionedFromLowToHighHTML: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfHorizontalAreaOS: {
        "class": o("Horizontal", "MemberOfPositionedAreaOS")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfLeftToRightAreaOS: {
        "class": o("MemberOfHorizontalAreaOS"),
        context: {
            areaOSPositionedFromLowToHighHTML: true
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    MemberOfRightToLeftAreaOS: {
        "class": o("MemberOfHorizontalAreaOS"),
        context: {
            areaOSPositionedFromLowToHighHTML: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Member of AreaSet Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Horizontal: {
        context: {
            lowHTMLLength: "left",
            highHTMLLength: "right",
            centerLength: "horizontal-center",

            lowHTMLGirth: "top",
            highHTMLGirth: "bottom",
            centerGirth: "vertical-center",

            beginningGirth: "bottom",
            endGirth: "top",

            // in case this class is inherited by an area which also inherits DraggableWeakMouseAttachment:
            verticallyDraggable: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Vertical: {
        context: {
            lowHTMLLength: "top",
            highHTMLLength: "bottom",
            centerLength: "vertical-center",

            lowHTMLGirth: "left",
            highHTMLGirth: "right",
            centerGirth: "horizontal-center",

            beginningGirth: "left",
            endGirth: "right",

            // in case this class is inherited by an area which also inherits DraggableWeakMouseAttachment:
            horizontallyDraggable: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OrientedElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofVerticalElement: [
                    "Vertical",
                    [classOfArea, [{ refOrientedElement: _ }, [me]]]
                ]
            }
        },
        { // default
            context: {
                refOrientedElement: [embedding] // default value
            }
        },
        {
            qualifier: { ofVerticalElement: true },
            "class": "Vertical"
        },
        {
            qualifier: { ofVerticalElement: false },
            "class": "Horizontal"
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DefaultLogicalBeginningAndEnd: {
        context: {
            logicalBeginning: {
                element: [me],
                type: [{ lowHTMLLength: _ }, [me]]
            },
            logicalEnd: {
                element: [me],
                type: [{ highHTMLLength: _ }, [me]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AlignCenterWithEmbedding: {
        "vertical-center": 0,
        "horizontal-center": 0
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. Inheriting class should inherit Vertical/Horizontal
    // 2. girthAxisOffsetFromEmbedding: 0, by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchEmbeddingOnGirthAxis: {
        context: {
            girthAxisOffsetFromEmbedding: 0
        },
        position: {
            attachToEmbeddingLowHTMLGirth: {
                point1: {
                    element: [embedding],
                    type: [{ lowHTMLGirth: _ }, [me]],
                    content: true
                },
                point2: {
                    type: [{ lowHTMLGirth: _ }, [me]]
                },
                equals: [{ girthAxisOffsetFromEmbedding: _ }, [me]]
            },
            attachToEmbeddingHighHTMLGirth: {
                point1: {
                    type: [{ highHTMLGirth: _ }, [me]]
                },
                point2: {
                    element: [embedding],
                    type: [{ highHTMLGirth: _ }, [me]],
                    content: true
                },
                equals: [{ girthAxisOffsetFromEmbedding: _ }, [me]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. Inheriting class should inherit Vertical/Horizontal
    // 2. lengthAxisOffsetFromEmbedding: 0, by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchEmbeddingOnLengthAxis: {
        context: {
            lengthAxisOffsetFromEmbedding: 0
        },
        position: {
            attachToEmbeddingBeginningLength: {
                point1: {
                    element: [embedding],
                    type: [{ lowHTMLLength: _ }, [me]],
                    content: true
                },
                point2: {
                    type: [{ lowHTMLLength: _ }, [me]]
                },
                equals: [{ lengthAxisOffsetFromEmbedding: _ }, [me]]
            },
            attachToEmbeddingEndLength: {
                point1: {
                    type: [{ highHTMLLength: _ }, [me]]
                },
                point2: {
                    element: [embedding],
                    type: [{ highHTMLLength: _ }, [me]],
                    content: true
                },
                equals: [{ lengthAxisOffsetFromEmbedding: _ }, [me]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class takes as an input an areaRef, and gives the inheriting area the dimensions and position of that areaRef.
    // The dimensions and position flags, true by default, can be turned off by the inheriting class
    // API:
    // 1. match: an areaRef.
    // 2. matchDimensions: boolean (true by default)
    // 3. matchPosition: boolean (true by default)
    // 4. matchContent: boolean (false by default, i.e. to match frame)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MatchArea: o(
        { // variant-controller
            qualifier: "!",
            context: {
                matchDimensions: true,
                matchPosition: true,
                matchContent: false
            }
        },
        { // default
        },
        {
            qualifier: { matchPosition: true },
            position: {
                matchAreaLeftAnchor: {
                    point1: {
                        type: "left",
                        content: [{ matchContent: _ }, [me]]
                    },
                    point2: {
                        element: [{ match: _ }, [me]],
                        type: "left",
                        content: [{ matchContent: _ }, [me]]
                    },
                    equals: 0
                },
                matchAreaTopAnchor: {
                    point1: {
                        type: "top",
                        content: [{ matchContent: _ }, [me]]
                    },
                    point2: {
                        element: [{ match: _ }, [me]],
                        type: "top",
                        content: [{ matchContent: _ }, [me]]
                    },
                    equals: 0
                }
            }
        },
        {
            qualifier: { matchDimensions: true },
            position: {
                matchAreaWidth: {
                    pair1: {
                        point1: {
                            type: "left",
                            content: [{ matchContent: _ }, [me]]
                        },
                        point2: {
                            type: "right",
                            content: [{ matchContent: _ }, [me]]
                        }
                    },
                    pair2: {
                        point1: {
                            element: [{ match: _ }, [me]],
                            type: "left",
                            content: [{ matchContent: _ }, [me]]
                        },
                        point2: {
                            element: [{ match: _ }, [me]],
                            type: "right",
                            content: [{ matchContent: _ }, [me]]
                        }
                    },
                    ratio: 1
                },
                matchAreaHeight: {
                    pair1: {
                        point1: {
                            type: "top",
                            content: [{ matchContent: _ }, [me]]
                        },
                        point2: {
                            type: "bottom",
                            content: [{ matchContent: _ }, [me]]
                        }
                    },
                    pair2: {
                        point1: {
                            element: [{ match: _ }, [me]],
                            type: "top",
                            content: [{ matchContent: _ }, [me]]
                        },
                        point2: {
                            element: [{ match: _ }, [me]],
                            type: "bottom",
                            content: [{ matchContent: _ }, [me]]
                        }
                    },
                    ratio: 1
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. viewForInView: embedding, by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    InView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inView: [cond,
                    [{ generalDebug: { inViewIsTrue: _ } }, [globalDefaults]],
                    o(
                        {
                            on: false,
                            use: [not,
                                o( // out of view if one of these is true
                                    [greaterThanOrEqual,
                                        [offset,
                                            {
                                                element: [{ viewForInView: _ }, [me]],
                                                type: "bottom"
                                            },
                                            { type: "top" }
                                        ],
                                        0
                                    ],
                                    [greaterThanOrEqual,
                                        [offset,
                                            { type: "bottom" },
                                            {
                                                element: [{ viewForInView: _ }, [me]],
                                                type: "top"
                                            }
                                        ],
                                        0
                                    ],
                                    [greaterThanOrEqual,
                                        [offset,
                                            {
                                                element: [{ viewForInView: _ }, [me]],
                                                type: "right"
                                            },
                                            { type: "left" }
                                        ],
                                        0
                                    ],
                                    [greaterThanOrEqual,
                                        [offset,
                                            { type: "right" },
                                            {
                                                element: [{ viewForInView: _ }, [me]],
                                                type: "left"
                                            }
                                        ],
                                        0
                                    ]
                                )
                            ]
                        },
                        {
                            on: true,
                            use: true
                        }
                    )
                ]
            }
        },
        { // default
            context: {
                viewForInView: [embedding]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Note: Inheriting class should specify the right frame posPoint.
    // API: 
    // 1. borderTopWidth / borderBottomWidth / borderLeftWidth / borderRightWidth: default provided.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContentSpillsOver: o(
        { // default
            "class": o("ContentSpillsOverDesign", "GeneralArea"),
            context: {
                borderTopWidth: 0,
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0
            },
            independentContentPosition: true,
            position: {
                contentSpilloverLeftToFrame: {
                    point1: { type: "left" },
                    point2: { type: "left", content: true },
                    equals: [{ borderLeftWidth: _ }, [me]]
                },
                contentSpilloverTopToFrame: {
                    point1: { type: "top" },
                    point2: { type: "top", content: true },
                    equals: [{ borderTopWidth: _ }, [me]]
                },
                contentSpilloverBottomToFrame: {
                    point1: { type: "bottom", content: true },
                    point2: { type: "bottom" },
                    equals: [{ borderBottomWidth: _ }, [me]]
                },
                // See ContentSpillsOverDesign: that's where the text overflow is handled
                labelDisplayWidthRight: {
                    point1: { type: "left", content: true },
                    point2: { label: "displayWidthRight" },
                    equals: [displayWidth]
                },
                contentSpilloverContentRightNotPastFrame: {
                    point1: { type: "right", content: true },
                    point2: { type: "right" },
                    min: [{ borderRightWidth: _ }, [me]]
                },
                contentSpilloverContentRightNotPastDisplayWidth: {
                    point1: { type: "right", content: true },
                    point2: { label: "displayWidthRight" },
                    min: [{ borderRightWidth: _ }, [me]]
                },
                eitherContentRightMatchesFrameRight: {
                    point1: { type: "right", content: true },
                    point2: { type: "right" },
                    equals: [{ borderRightWidth: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "contentSpillsOver" }
                },
                orContentRightMatchesDisplayWidthRight: {
                    point1: { type: "right", content: true },
                    point2: { label: "displayWidthRight" },
                    equals: [{ borderRightWidth: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    orGroups: { label: "contentSpillsOver" }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class tightly wraps its embedded areas to fit their dimensions.  This class is used when the embedding area's dimensions are determined by its embedded areas 
    // (e.g. the facet's right side is positioned relative to the amoeba's right side).
    // API:
    // 1. minWrapRefAreas: specify the reference areas which are to be minWrapped. Default: [embedded]
    // 2. minWrapCompressionPriority: the priority associated with the compression constraints. Default: positioningPrioritiesConstants.defaultPressure
    // 3. minWrapAround/Left/Right/Top/Bottom: the sides which are to be wrapped around. minWrapAround is for all sides. This should be a number.
    // 4. minWrapHorizontal/minWrapVertical: flags that control the compression constraints on the two axes. Default: true.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinWrap: o(
        { // variant-controller
            qualifier: "!",
            context: {
                minWrapHorizontal: true,
                minWrapVertical: true,

                // by default, the side-specific context-label has the value of minWrapAround. Can be overridden by the inheriting class.
                minWrapLeft: [{ minWrapAround: _ }, [me]],
                minWrapRight: [{ minWrapAround: _ }, [me]],
                minWrapTop: [{ minWrapAround: _ }, [me]],
                minWrapBottom: [{ minWrapAround: _ }, [me]]

            }
        },
        { // default
            context: {
                // default value, can be overridden by inheriting classes
                minWrapRefAreas: [embedded],
                minWrapCompressionPriority: positioningPrioritiesConstants.defaultPressure,
                // note: by leaving minWrapAround not defined, by default, we spare the various constraints defined in the variants below - a positioning optimization
            }
        },
        {
            qualifier: { minWrapHorizontal: true },
            position: {
                minWrapNonNegativeWidth: {
                    point1: { type: "left", content: true },
                    point2: { type: "right", content: true },
                    min: 0
                }
            }
        },
        {
            qualifier: { minWrapVertical: true },
            position: {
                minWrapNonNegativeHeight: {
                    point1: { type: "top", content: true },
                    point2: { type: "bottom", content: true },
                    min: 0
                }
            }
        },
        {
            qualifier: {
                minWrapHorizontal: true,
                minWrapLeft: true
            },
            position: {
                minWrapLeftConstraint: {
                    point1: {
                        type: "left",
                        content: true
                    },
                    point2: {
                        element: [{ minWrapRefAreas: _ }, [me]],
                        type: "left"
                    },
                    min: [{ minWrapLeft: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                minWrapHorizontal: true,
                minWrapRight: true
            },
            position: {
                minWrapRightConstraint: {
                    point1: {
                        element: [{ minWrapRefAreas: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "right",
                        content: true
                    },
                    min: [{ minWrapRight: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                minWrapHorizontal: true,
                minWrapLeft: true,
                minWrapRight: true
            },
            position: {
                minWrapWidthConstraint: {
                    point1: {
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "right",
                        content: true
                    },
                    equals: 0,
                    priority: [{ minWrapCompressionPriority: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                minWrapVertical: true,
                minWrapTop: true
            },
            position: {
                minWrapTopConstraint: {
                    point1: {
                        type: "top",
                        content: true
                    },
                    point2: {
                        element: [{ minWrapRefAreas: _ }, [me]],
                        type: "top"
                    },
                    min: [{ minWrapTop: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                minWrapVertical: true,
                minWrapBottom: true
            },
            position: {
                minWrapBottomConstraint: {
                    point1: {
                        element: [{ minWrapRefAreas: _ }, [me]],
                        type: "bottom"
                    },
                    point2: {
                        type: "bottom",
                        content: true
                    },
                    min: [{ minWrapBottom: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                minWrapVertical: true,
                minWrapTop: true,
                minWrapBottom: true
            },
            position: {
                minWrapHeightConstraint: {
                    point1: {
                        type: "top",
                        content: true
                    },
                    point2: {
                        type: "bottom",
                        content: true
                    },
                    equals: 0,
                    priority: [{ minWrapCompressionPriority: _ }, [me]]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits MinWrap, and limits the minWrap constraints to the horizontal axis only.
    // API (also see MinWrap):
    // 1. minWrapLeft/Right: 0, by default. 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinWrapHorizontal: {
        "class": "MinWrap",
        context: {
            minWrapVertical: false,

            minWrapLeft: 0,
            minWrapRight: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits MinWrap, and limits the minWrap constraints to the vertical axis only.
    // API (also see MinWrap):
    // 1. minWrapTop/Bottom: 0, by default. 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinWrapVertical: {
        "class": "MinWrap",
        context: {
            minWrapHorizontal: false,

            minWrapTop: 0,
            minWrapBottom: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class limits the position of the inheriting area to the content frame of the confinedToArea areaRef.
    // Currently used by Icon, to limit its position to the confines of its embedding, IconEmbedding.
    //
    // API: 
    // confinedToArea: an areaRef. by default, iconEmbedding.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ConfinedToArea: {
        "class": "GeneralArea",
        context: {
            confinedToArea: [{ myApp: { iconEmbedding: _ } }, [me]]
        },
        position: {
            leftWithinConfinedToArea: {
                point1: {
                    element: [{ confinedToArea: _ }, [me]],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                min: 0,
                priority: positioningPrioritiesConstants.strongerThanDefault
            },
            rightWithinConfinedToArea: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ confinedToArea: _ }, [me]],
                    type: "right",
                    content: true
                },
                min: 0,
                priority: positioningPrioritiesConstants.strongerThanDefault
            },
            topWithinConfinedToArea: {
                point1: {
                    element: [{ confinedToArea: _ }, [me]],
                    type: "top",
                    content: true
                },
                point2: {
                    type: "top"
                },
                min: 0,
                priority: positioningPrioritiesConstants.strongerThanDefault
            },
            bottomWithinConfinedToArea: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ confinedToArea: _ }, [me]],
                    type: "bottom",
                    content: true
                },
                min: 0,
                priority: positioningPrioritiesConstants.strongerThanDefault
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class limits the position of the inheriting area to outside excludedFromAreas
    //
    // API: 
    // excludedFromAreas: an os of areaRefs from which the inheriting class is to be excluded (positioning-wise).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExcludedFromAreas: {
        children: {
            positioningExclusions: {
                data: [{ excludedFromAreas: _ }, [me]],
                description: {
                    "class": "ExcludedFromArea"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class limits the position of the inheriting area to outside a single excludedFromArea. It is used by ExcludedFromAreas
    //
    // API: 
    // excludedFromArea: an areaRef to a single area.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ExcludedFromArea: {
        "class": "GeneralArea",
        context: {
            excludedFromArea: [{ param: { areaSetContent: _ } }, [me]]
        },
        position: {
            leftOfExcludedFromAreaLeft: {
                point1: {
                    element: [embedding],
                    type: "right"
                },
                point2: {
                    element: [{ excludedFromArea: _ }, [me]],
                    type: "left"
                },
                min: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "excludeFromArea" }
            },
            rightOfExcludedFromAreaRight: {
                point1: {
                    element: [{ excludedFromArea: _ }, [me]],
                    type: "right"
                },
                point2: {
                    element: [embedding],
                    type: "left"
                },
                min: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "excludeFromArea" }
            },
            bottomAboveExcludedFromAreaTop: {
                point1: {
                    element: [embedding],
                    type: "bottom"
                },
                point2: {
                    element: [{ excludedFromArea: _ }, [me]],
                    type: "top"
                },
                min: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "excludeFromArea" }
            },
            topBelowExcludedFromAreaBottom: {
                point1: {
                    element: [{ excludedFromArea: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    element: [embedding],
                    type: "top"
                },
                min: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "excludeFromArea" }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The inheriting class will have zero dimensions (and will be positioned at its embedding's top/left corner.
    // Note: Inheriting classes should use it only for variants of theirs in which they are to have no dimensions.
    //       If those areas always have no dimension, but merely serve as a vessel for various data/calculations, then this should not be inherited
    //       as it merely adds undue load to the positioning system.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ZeroDimensions: {
        position: {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        }
    },

    ZeroWidth: {
        position: {
            width: 0,
        }
    },

    ZeroHeight: {
        position: {
            height: 0,
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ContentDimensions: {
        context: {
            contentWidth: [offset,
                {
                    type: "left",
                    content: true
                },
                {
                    type: "right",
                    content: true
                }
            ],
            contentHeight: [offset,
                {
                    type: "top",
                    content: true
                },
                {
                    type: "bottom",
                    content: true
                }
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areaToStabilize (can be an os of areas too!)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AbsoluteStabilityOfArea: {
        "class": o("AbsoluteStabilityOfAreasHorizontal", "AbsoluteStabilityOfAreasVertical"),
        context: {
            areaToStabilizeHorizontal: [{ areaToStabilize: _ }, [me]],
            areaToStabilizeVertical: [{ areaToStabilize: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areaToStabilizeHorizontal (can be an os of areas too!)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AbsoluteStabilityOfAreasHorizontal: {
        "class": "GeneralArea",
        position: {
            absoluteStabilityLeft: {
                point1: {
                    element: [{ myApp: _ }, [me]],
                    type: "left"
                },
                point2: {
                    element: [{ areaToStabilizeHorizontal: _ }, [me]],
                    type: "left"
                },
                stability: true,
                priority: positioningPrioritiesConstants.strongerThanDefault // note the higher-than-default stability
            },
            absoluteStabilityRight: {
                point1: {
                    element: [{ myApp: _ }, [me]],
                    type: "left"
                },
                point2: {
                    element: [{ areaToStabilizeHorizontal: _ }, [me]],
                    type: "right"
                },
                stability: true,
                priority: positioningPrioritiesConstants.strongerThanDefault // note the higher-than-default stability
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. areaToStabilizeVertical (can be an os of areas too!)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AbsoluteStabilityOfAreasVertical: {
        "class": "GeneralArea",
        position: {
            absoluteStabilityTop: {
                point1: {
                    element: [{ myApp: _ }, [me]],
                    type: "top"
                },
                point2: {
                    element: [{ areaToStabilizeVertical: _ }, [me]],
                    type: "top"
                },
                stability: true,
                priority: positioningPrioritiesConstants.strongerThanDefault // note the higher-than-default stability
            },
            absoluteStabilityBottom: {
                point1: {
                    element: [{ myApp: _ }, [me]],
                    type: "top"
                },
                point2: {
                    element: [{ areaToStabilizeVertical: _ }, [me]],
                    type: "bottom"
                },
                stability: true,
                priority: positioningPrioritiesConstants.strongerThanDefault // note the higher-than-default stability
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // In the absence of frame: "intersection".
    // Note we check if this is a real intersection of a 'fake' one (i.e. created as an areaSet, with the 'referredOf' as its pram.areaSetContent).
    // If it's the former, we use intersection: true. If it's the latter, we use verticalIntersectingParent/horizontalIntersectingParent and 
    // not 'intersection: true'. 'intersection: true is more generalized (when, for example, the column extends below the bottom of the row), 
    // but for now, we inherit FrameWRTIntersection for 'fake' intersections in situations where such edge cases do not apply (or so we hope).
    // 
    // API:
    // 1. frameOffsetFromIntersectionLeft/Right/TopBottom: can be overridden by inheriting class. Default: 0
    // 2. contentBorderTracksIntersectingParentsContent: should the content border be defined based on the content of the intersecting parents. 
    //    false, by default.
    //    If true:
    // 2.1 Inheriting class should determine which intersecting parent is horizontalIntersectingParent and which is verticalIntersectingParent.
    // 2.2 Inheriting class may override contentOffsetFromIntersectingLeft/Right/Top/Bottom. 0, by default.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FrameWRTIntersection: o(
        { // variant-controller
            qualifier: "!",
            context: {
                isRealIntersection: false, // [referredOf] - for now, we avoid the isRealIntersection: true variant, to avoid using intersection: true
                // in positioning constraints. it is too costly for the time being.
                contentBorderTracksIntersectingParentsContent: false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                frameOffsetFromIntersectionLeft: 0,
                frameOffsetFromIntersectionRight: 0,
                frameOffsetFromIntersectionTop: 0,
                frameOffsetFromIntersectionBottom: 0
            },
            position: {
                leftFrameWRTIntersection: {
                    point1: {
                        // see variants below for isRealIntersection
                        type: "left"
                    },
                    point2: { type: "left" },
                    equals: [{ frameOffsetFromIntersectionLeft: _ }, [me]]
                },
                rightFrameWRTIntersection: {
                    point1: { type: "right" },
                    point2: {
                        // see variants below for isRealIntersection
                        type: "right"
                    },
                    equals: [{ frameOffsetFromIntersectionRight: _ }, [me]]
                },
                topFrameWRTIntersection: {
                    point1: {
                        // see variants below for isRealIntersection
                        type: "top"
                    },
                    point2: { type: "top" },
                    equals: [{ frameOffsetFromIntersectionTop: _ }, [me]]
                },
                bottomFrameWRTIntersection: {
                    point1: { type: "bottom" },
                    point2: {
                        // see variants below for isRealIntersection
                        type: "bottom"
                    },
                    equals: [{ frameOffsetFromIntersectionBottom: _ }, [me]]
                }
            }
        },
        {
            qualifier: { isRealIntersection: false },
            position: {
                leftFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point1: { element: [{ verticalIntersectingParent: _ }, [me]] }
                },
                rightFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point2: { element: [{ verticalIntersectingParent: _ }, [me]] }
                },
                topFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point1: { element: [{ horizontalIntersectingParent: _ }, [me]] }
                },
                bottomFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point2: { element: [{ horizontalIntersectingParent: _ }, [me]] }
                }
            }
        },
        {
            qualifier: { isRealIntersection: true },
            position: {
                leftFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point1: { intersection: true }
                },
                rightFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point2: { intersection: true }
                },
                topFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point1: { intersection: true }
                },
                bottomFrameWRTIntersection: {
                    // remainder of definition provided in default clause above
                    point2: { intersection: true }
                }
            }
        },
        {
            qualifier: { contentBorderTracksIntersectingParentsContent: false },
            independentContentPosition: false // content to match frame of intersection
        },
        {
            qualifier: { contentBorderTracksIntersectingParentsContent: true },
            independentContentPosition: true, // content position to be specified herein
            context: {
                contentOffsetFromIntersectingLeft: 0,
                contentOffsetFromIntersectingRight: 0,
                contentOffsetFromIntersectingTop: 0,
                contentOffsetFromIntersectingBottom: 0
            },
            position: {
                leftContentWRTContentOfVerticalIntersectingParent: {
                    point1: {
                        element: [{ verticalIntersectingParent: _ }, [me]],
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "left",
                        content: true
                    },
                    equals: [{ contentOffsetFromIntersectingLeft: _ }, [me]]
                },
                rightContentWRTContentOfVerticalIntersectingParent: {
                    point1: {
                        element: [{ verticalIntersectingParent: _ }, [me]],
                        type: "right",
                        content: true
                    },
                    point2: {
                        type: "right",
                        content: true
                    },
                    equals: [{ contentOffsetFromIntersectingRight: _ }, [me]]
                },
                topContentWRTContentOfHorizontalIntersectingParent: {
                    point1: {
                        element: [{ horizontalIntersectingParent: _ }, [me]],
                        type: "top",
                        content: true
                    },
                    point2: {
                        type: "top",
                        content: true
                    },
                    equals: [{ contentOffsetFromIntersectingTop: _ }, [me]]
                },
                bottomContentWRTContentOfHorizontalIntersectingParent: {
                    point1: {
                        element: [{ horizontalIntersectingParent: _ }, [me]],
                        type: "bottom",
                        content: true
                    },
                    point2: {
                        type: "bottom",
                        content: true
                    },
                    equals: [{ contentOffsetFromIntersectingBottom: _ }, [me]]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. posPointAHorizontal, posPointAVertical 
    // 2. posPointBHorizontal, posPointBVertical
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RectangleAroundTwoPosPoints: {
        "class": "GeneralArea",
        position: {
            leftOfPosPointAHorizontal: {
                point1: { type: "left" },
                point2: [{ posPointAHorizontal: _ }, [me]],
                min: 0
            },
            leftOfPosPointBHorizontal: {
                point1: { type: "left" },
                point2: [{ posPointBHorizontal: _ }, [me]],
                min: 0
            },
            eitherLeftEqualsPosPointsAHorizontal: {
                point1: { type: "left" },
                point2: [{ posPointAHorizontal: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleLeft" }
            },
            orLeftEqualsPosPointsBHorizontal: {
                point1: { type: "left" },
                point2: [{ posPointBHorizontal: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleLeft" }
            },
            rightOfPosPointAHorizontal: {
                point1: [{ posPointAHorizontal: _ }, [me]],
                point2: { type: "right" },
                min: 0
            },
            rightOfPosPointBHorizontal: {
                point1: [{ posPointBHorizontal: _ }, [me]],
                point2: { type: "right" },
                min: 0
            },

            eitherRightEqualsPosPointsAHorizontal: {
                point1: { type: "right" },
                point2: [{ posPointAHorizontal: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleRight" }
            },
            orRightEqualsPosPointsBHorizontal: {
                point1: { type: "right" },
                point2: [{ posPointBHorizontal: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleRight" }
            },

            abovePosPointAVertical: {
                point1: { type: "top" },
                point2: [{ posPointAVertical: _ }, [me]],
                min: 0
            },
            abovePosPointBVertical: {
                point1: { type: "top" },
                point2: [{ posPointBVertical: _ }, [me]],
                min: 0
            },
            eitherTopEqualsPosPointsAVertical: {
                point1: { type: "top" },
                point2: [{ posPointAVertical: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleTop" }
            },
            orTopEqualsPosPointsBVertical: {
                point1: { type: "top" },
                point2: [{ posPointBVertical: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleTop" }
            },
            belowPosPointAVertical: {
                point1: [{ posPointAVertical: _ }, [me]],
                point2: { type: "bottom" },
                min: 0
            },
            belowPosPointBVertical: {
                point1: [{ posPointBVertical: _ }, [me]],
                point2: { type: "bottom" },
                min: 0
            },
            eitherBottomEqualsPosPointsAVertical: {
                point1: { type: "bottom" },
                point2: [{ posPointAVertical: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleBottom" }
            },
            orBottomEqualsPosPointsBVertical: {
                point1: { type: "bottom" },
                point2: [{ posPointBVertical: _ }, [me]],
                equals: 0,
                priority: positioningPrioritiesConstants.weakerThanDefault,
                orGroups: { label: "rectangleBottom" }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    CreateRectangleAroundMouseDownAndPointer: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                "*createRectangle": false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                "*absXOfMouseDown": 0,
                "*absYOfMouseDown": 0
            },
            write: {
                onCreateRectangleAroundMouseDownAndPointerMouseDown: {
                    // this means we're looking for a mouseDown in this area, though it could also be a mouseDown in an embeddedStar
                    // area that in fact blocks the mouseDown, or of an intersection area.
                    upon: [and,
                        [overlap, [me], [pointer]],
                        anyMouseDownEvent
                    ],
                    true: {
                        createRectangle: {
                            to: [{ createRectangle: _ }, [me]],
                            merge: true
                        },
                        recordAbsX: {
                            to: [{ absXOfMouseDown: _ }, [me]],
                            merge: [offset,
                                { element: [areaOfClass, "ScreenArea"], type: "left" },
                                { element: [pointer], type: "left" }
                            ]
                        },
                        recordAbsY: {
                            to: [{ absYOfMouseDown: _ }, [me]],
                            merge: [offset,
                                { element: [areaOfClass, "ScreenArea"], type: "top" },
                                { element: [pointer], type: "top" }
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { createRectangle: true },
            children: {
                rectangle: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "RectangleAroundMouseDownAndPointer"
                    }
                }
            },
            write: {
                onCreateRectangleAroundMouseDownAndPointerMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        destroyRectangle: {
                            to: [{ createRectangle: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RectangleAroundMouseDownAndPointer: o(
        { // default`
            "class": o("RectangleAroundTwoPosPoints", "Icon", "Border"),
            context: {
                // RectangleAroundTwoPosPoints params
                posPointAHorizontal: { label: "MouseDownHorizontal" },
                posPointAVertical: { label: "MouseDownVertical" },
                posPointBHorizontal: { element: [pointer], type: "left" },
                posPointBVertical: { element: [pointer], type: "top" }
            },
            position: {
                labelMouseDownHorizontal: {
                    point1: { element: [areaOfClass, "ScreenArea"], type: "left" },
                    point2: { label: "MouseDownHorizontal" },
                    equals: [{ absXOfMouseDown: _ }, [expressionOf]]
                },
                labelMouseDownVertical: {
                    point1: { element: [areaOfClass, "ScreenArea"], type: "top" },
                    point2: { label: "MouseDownVertical" },
                    equals: [{ absYOfMouseDown: _ }, [expressionOf]]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class attempts to create an intersection between its embedding area and an area of interest. It will succeed, by definition, only
    // iff they overlap. And so the existence of the intersection is proof of their overlap.
    // 
    // API: 
    // 1. areaOfOverlapInterest: areaRef
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OverlapWithArea: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                overlapWithArea: [{ children: { xtionWithAreaOfOverlapInterest: _ } }, [me]]
            }
        },
        { // default
            children: {
                xtionWithAreaOfOverlapInterest: {
                    partner: [{ areaOfOverlapInterest: _ }, [me]],
                    description: {
                        // nothing else to do with this area
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the inheriting area with a minimum offset from a vertical/horizontal anchor points.
    // API:
    // 1. moAnchorVerticalPoint, moAnchorHorizontalPoint: the vertical/horizontal anchor posPoints to which we want to minimize the offset.
    // 2. moShipVerticalPoint, moShipHorizontalPoint: the vertical/horizontal posPoints of the inheriting area, whose offset from moAnchorVerticalPoint/moAnchorHorizontalPoint we'd like
    //   to minimize. By default: top/left of the inheriting area. The inheriting class may override this by specifying: atomic({ <posPoint> }).
    // 3. moShipAnchorHorizontalOffset/moShipAnchorVerticalOffset: offset between the anchor and the ship on each of the axes. default values defined.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinOffsetFromAnchor: o(
        { // variant-controller
            qualifier: "!",
            context: {
                moShipAnchorHorizontalOffsetNonNegative: [greaterThanOrEqual, [{ moShipAnchorHorizontalOffset: _ }, [me]], 0],
                moShipAnchorVerticalOffsetNonNegative: [greaterThanOrEqual, [{ moShipAnchorVerticalOffset: _ }, [me]], 0]
            }

        },
        { // default 
            context: {
                moShipVerticalPoint: { type: "top" },
                moShipHorizontalPoint: { type: "left" },
                moShipAnchorHorizontalOffset: 0,
                moShipAnchorVerticalOffset: 0
            }
        },
        {
            qualifier: { moShipAnchorHorizontalOffsetNonNegative: true },
            position: {
                moHorizontal: {
                    point1: [{ moShipHorizontalPoint: _ }, [me]],
                    point2: [{ moAnchorHorizontalPoint: _ }, [me]],
                    equals: [{ moShipAnchorHorizontalOffset: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        },
        {
            qualifier: { moShipAnchorVerticalOffsetNonNegative: true },
            position: {
                moVertical: {
                    point1: [{ moShipVerticalPoint: _ }, [me]],
                    point2: [{ moAnchorVerticalPoint: _ }, [me]],
                    equals: [{ moShipAnchorVerticalOffset: _ }, [me]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        },
        {
            qualifier: { moShipAnchorHorizontalOffsetNonNegative: false },
            position: {
                moHorizontal: {
                    // swapping point1 & point2 wrt moShipAnchorHorizontalOffsetNonNegative: true
                    point1: [{ moAnchorHorizontalPoint: _ }, [me]],
                    point2: [{ moShipHorizontalPoint: _ }, [me]],
                    equals: [abs, [{ moShipAnchorHorizontalOffset: _ }, [me]]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        },
        {
            qualifier: { moShipAnchorVerticalOffsetNonNegative: false },
            position: {
                moVertical: {
                    // swapping point1 & point2 wrt moShipAnchorVerticalOffsetNonNegative: true
                    point1: [{ moAnchorVerticalPoint: _ }, [me]],
                    point2: [{ moShipVerticalPoint: _ }, [me]],
                    equals: [abs, [{ moShipAnchorVerticalOffset: _ }, [me]]],
                    priority: positioningPrioritiesConstants.weakerThanDefaultPressure
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class minimizes the inheriting area's offset from the mouse. 
    // It minimizes the offset between the moShipHorizontalPoint/moShipVerticalPoint and the moAnchorHorizontalPoint/moShipVerticalPoint.
    // API:
    // 1. The inheriting class may override the default definitions for the above-mentioned posPoints by specifying: atomic({ <posPoint> }).
    // 2. If the inheriting class defines tmd (e.g. ReorderHandle), then on mouseDown, the offset between the anchor posPoint and the ship posPoint 
    //    (on both axes) will be recorded in the moShipAnchorHorizontalOffset/moShipAnchorVerticalOffset. This behavior ensures that such an area won't
    //    "jump" on mouseDown to its proper position wrt to the pointer.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MinOffsetFromPointer: {
        "class": "MinOffsetFromAnchor",
        context: {
            // MinOffsetFromAnchor params
            moAnchorHorizontalPoint: {
                element: [pointer],
                type: "left"
            },
            moAnchorVerticalPoint: {
                element: [pointer],
                type: "top"
            },
            "*moShipAnchorHorizontalOffset": 0,
            "*moShipAnchorVerticalOffset": 0
        },
        write: {
            onMinOffsetFromPointerOnTmd: {
                upon: mouseDownEvent,
                true: {
                    setmoShipAnchorHorizontalOffset: {
                        to: [{ moShipAnchorHorizontalOffset: _ }, [me]],
                        merge: [offset,
                            [{ moShipHorizontalPoint: _ }, [me]],
                            [{ moAnchorHorizontalPoint: _ }, [me]]
                        ]
                    },
                    setmoShipAnchorVerticalOffset: {
                        to: [{ moShipAnchorVerticalOffset: _ }, [me]],
                        merge: [offset,
                            [{ moShipVerticalPoint: _ }, [me]],
                            [{ moAnchorVerticalPoint: _ }, [me]]
                        ]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: the x and y coordinates of point B. (point A is the center of the embedding area).
    // See ManhattanDistanceBetweenTwoPoints
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ManhattanDistanceFromCenterOfEmbedding: {
        "class": "ManhattanDistanceBetweenTwoPoints",
        context: {
            xA: {
                element: [embedding],
                type: "horizontal-center"
            },
            yA: {
                element: [embedding],
                type: "vertical-center"
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class provides a metric for the Manhattan distance between two points: it calculates the sum of the absolute offset between them on both axes.
    // this distance will be represented by a context label 'manhattanDistanceBetweenTwoPoints', and by the pair of positioning labels, "beginning" and "end".
    //
    // This class has two children which inherits AbsOffsetBetweenTwoPosPoints - each calculating the abs offset for one of the axes.
    //
    // API: 
    // xA, yA, xB, yB - the x and y coordinates of two points, A and B.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ManhattanDistanceBetweenTwoPoints: {
        context: {
            manhattanDistanceBetweenTwoPoints: [offset,
                { label: "beginning" },
                { label: "end" }
            ]
        },
        children: {
            xAbsOffset: {
                description: {
                    "class": "AbsOffsetBetweenTwoPosPoints",
                    context: {
                        posPointA: [{ xA: _ }, [embedding]],
                        posPointB: [{ xB: _ }, [embedding]]
                    }
                }
            },
            yAbsOffset: {
                description: {
                    "class": "AbsOffsetBetweenTwoPosPoints",
                    context: {
                        posPointA: [{ yA: _ }, [embedding]],
                        posPointB: [{ yB: _ }, [embedding]]
                    }
                }
            }
        },
        position: {
            // align the two offsets (one for each axis) along a single (virtual) axis
            labelBeginning: {
                pair1: {
                    point1: { label: "beginning" },
                    point2: { label: "auxOffset" }
                },
                pair2: {
                    point1: {
                        element: [{ children: { xAbsOffset: _ } }, [me]],
                        label: "beginning"
                    },
                    point2: {
                        element: [{ children: { xAbsOffset: _ } }, [me]],
                        label: "end"
                    }
                },
                ratio: 1
            },
            labelEnd: {
                pair1: {
                    point1: { label: "auxOffset" },
                    point2: { label: "end" }
                },
                pair2: {
                    point1: {
                        element: [{ children: { yAbsOffset: _ } }, [me]],
                        label: "beginning"
                    },
                    point2: {
                        element: [{ children: { yAbsOffset: _ } }, [me]],
                        label: "end"
                    }
                },
                ratio: 1
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this class provides a metric for the abs distance between two posPoints.
    // this sum will be represented by a context label 'absOffsetBetweenTwoPosPoints', and by the pair of positioning labels, "beginning" and "end".
    //
    // API: 
    // posPointA/posPointB.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AbsOffsetBetweenTwoPosPoints: {
        context: {
            absOffsetBetweenTwoPosPoints: [offset,
                { label: "beginning" },
                { label: "end" }
            ]
        },
        position: {
            labelOneEnd: {
                pair1: {
                    point1: { label: "beginning" },
                    point2: { label: "oneEnd" }
                },
                pair2: {
                    point1: [{ posPointA: _ }, [me]],
                    point2: [{ posPointB: _ }, [me]]
                },
                ratio: 1
            },
            labelOtherEnd: {
                pair1: {
                    point1: { label: "otherEnd" },
                    point2: { label: "beginning" }
                },
                pair2: {
                    point1: [{ posPointA: _ }, [me]],
                    point2: [{ posPointB: _ }, [me]]
                },
                ratio: 1
            },
            pickAnEndI: {
                point1: { label: "end" },
                point2: { label: "oneEnd" },
                equals: 0,
                orGroups: { label: "pickAnEnd" }
            },
            pickAnEndII: {
                point1: { label: "end" },
                point2: { label: "otherEnd" },
                equals: 0,
                orGroups: { label: "pickAnEnd" }
            },
            beginningToEndNotNegative: {
                point1: { label: "beginning" },
                point2: { label: "end" },
                min: 0
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // This class defines a grid of static cells (not swappable) with a fixed number of columns (numberOfCellsInEachRow)
    // API:
    // 1. minWrap params (default minWrapAround:0)
    // 2. myGridCellData: the OS instanciating the gridCells
    // 3. numberOfCellsInEachRow: default 3
    // 4. imposeSameWidthToGridCells (wheather the gridCells will have the same width): false by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////    
    Grid: {
        "class": o("GeneralArea", "MinWrap"),
        context: {
            minWrapAround: 0,
            numberOfCellsInEachRow: 3,
            myGridCellData: o(),
            imposeSameWidthToGridCells: false,
        },
        children: {
            gridCells: {
                // description: provided by inheriting glass (e.g., class GridCell)
                data: [{ myGridCellData: _ }, [me]],
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The GridCell class. It assumes to be embedded in Grid
    // API:
    // 1. horizontalSpacing (default 5)
    // 2. verticalSpacing (default 5)
    // 3. sameWidthConstraint (dafault [{ imposeSameWidthToGridCells: _ }, [embedding]])
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    GridCell: o(
        { //variant-controller
            qualifier: "!",
            context: {
                sameWidthConstraint: [{ imposeSameWidthToGridCells: _ }, [embedding]],
                cellOnNewRow: [equal,
                    [mod,
                        [{ indexInAreaOS: _ }, [me]],
                        [{ numberOfCellsInEachRow: _ }, [embedding]]
                    ],
                    0
                ]
            }
        },
        { //default
            "class": o("MemberOfLeftToRightAreaOS"),
            context: {
                //areaOS: [{ children : {gridCells: _} }, [embedding]],
                areaOS: [
                    [embedded, [embedding]],
                    [areaOfClass, "GridCell"]
                ],
                indexInAreaOS: [
                    index,
                    [{ areaOS: _ }, [me]],
                    [me]
                ],
                horizontalSpacing: 5,
                verticalSpacing: 5,
                spacingFromPrev: [{ horizontalSpacing: _ }, [me]], //MemberOfLeftToRightAreaOS param
            }
        },
        {
            qualifier: { firstInAreaOS: true },
            position: {
                left: [{ minWrapAround: _ }, [embedding]],
                top: [{ minWrapAround: _ }, [embedding]]
            }
        },
        {
            qualifier: { lastInAreaOS: true },
            position: {
                rightOfLastGridCellFromEmbedding: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [embedding],
                        type: "right",
                        content: true
                    },
                    equals: [{ minWrapAround: _ }, [embedding]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                bottom: [{ minWrapAround: _ }, [embedding]]
            }
        },
        {
            qualifier: { cellOnNewRow: false },
            position: {
                verticallyAlignedWithPreviousElementTop: {
                    point1: { element: [{ myPrevInAreaOS: _ }, [me]], type: "top" },
                    point2: { type: "top" },
                    equals: 0
                }
            }
        },
        {
            qualifier: { cellOnNewRow: true },
            context: {
                activatePositionedAreaOS: false
            },
            position: {
                left: [{ minWrapAround: _ }, [embedding]],
                rowBelowPrev: {
                    point1: { element: [{ myPrevInAreaOS: _ }, [me]], type: "bottom" },
                    point2: { type: "top" },
                    equals: [{ verticalSpacing: _ }, [me]]
                }
            }
        },
        {
            qualifier: { sameWidthConstraint: true },
            position: {
                widthConstraint: {
                    pair1: {
                        point1: {
                            type: "left"
                        },
                        point2: {
                            type: "right"
                        }
                    },
                    pair2: {
                        point1: {
                            element: [embedding],
                            label: "virtualLeftAnchorGridCell"
                        },
                        point2: {
                            element: [embedding],
                            label: "virtualRightAnchorGridCell"
                        }
                    },
                    ratio: 1
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of positioning-related classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of 'upon' I/O-related Classes. To be inherited within a write object.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse down in area
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseDown: {
        upon: mouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlMouseDown: {
        upon: ctrlMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftMouseDown: {
        upon: shiftMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftCtrlMouseDown: {
        upon: shiftCtrlMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoCtrlMouseDown: {
        upon: noCtrlMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoShiftMouseDown: {
        upon: noShiftMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlNoShiftMouseDown: {
        upon: ctrlNoShiftMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftNoCtrlMouseDown: {
        upon: shiftNoCtrlMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoShiftNoCtrlMouseDown: {
        upon: noShiftNoCtrlMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoModifiersMouseDown: {
        upon: noModifiersMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse up in area
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseUp: {
        upon: mouseUpEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseUpNotMouseClick: {
        upon: mouseUpNotMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handlers for mouse click in area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseClick: {
        upon: mouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftMouseClick: {
        upon: shiftMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlMouseClick: {
        upon: ctrlMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoShiftMouseClick: {
        upon: noShiftMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoCtrlMouseClick: {
        upon: noCtrlMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for double click in area
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseDoubleClick: {
        upon: mouseDoubleClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for click in area after the DoubleClick option expired 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseDoubleClickExpired: {
        upon: mouseDoubleClickExpiredEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse down in area after the Click option expired 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseClickExpired: {
        upon: mouseClickExpiredEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse down anywhere.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAnyMouseDown: {
        upon: anyMouseDownEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse up anywhere
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAnyMouseUp: {
        upon: anyMouseUpEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for mouse click anywhere
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAnyMouseClick: {
        upon: anyMouseClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handler for double click anywhere
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAnyMouseDoubleClick: {
        upon: anyMouseDoubleClickEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseDownOutsideMe: {
        upon: mouseDownOutsideMeEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnMouseUpOutsideMe: {
        upon: mouseUpOutsideMeEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. altShiftKey
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAltShiftKey: {
        upon: altShiftKeyEvent
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlX: {
        upon: ctrlXEvent,
        true: {
            continuePropagation: false // prevent the browser from acting on this event
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlC: {
        upon: ctrlCEvent,
        true: {
            continuePropagation: false // prevent the browser from acting on this event
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlV: {
        upon: ctrlVEvent,
        true: {
            continuePropagation: false // prevent the browser from acting on this event        
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlS: {
        upon: ctrlSEvent,
        true: {
            continuePropagation: false // prevent the browser from acting on this event        
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. mouseEvent: can be mouseDown (by default), ctrlMouseDown, shiftMouseDown, shiftCtrlMouseDown, mouseClick, mouseDoubleClick, or mouseUp.
    // 2. Inheriting class should provide the true/"false" section of the onMouseEvent write object.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    MouseEventSwitch: o(
        {
            qualifier: "!",
            context: {
                mouseEvent: "mouseDown"
            }
        },
        {
            qualifier: { mouseEvent: "mouseDown" },
            write: {
                onMouseEvent: {
                    "class": "OnMouseDown"
                }
            }
        },
        {
            qualifier: { mouseEvent: "ctrlMouseDown" },
            write: {
                onMouseEvent: {
                    "class": "OnCtrlMouseDown"
                }
            }
        },
        {
            qualifier: { mouseEvent: "shiftMouseDown" },
            write: {
                onMouseEvent: {
                    "class": "OnShiftMouseDown"
                }
            }
        },
        {
            qualifier: { mouseEvent: "shiftCtrlMouseDown" },
            write: {
                onMouseEvent: {
                    "class": "OnShiftCtrlMouseDown"
                }
            }
        },
        {
            qualifier: { mouseEvent: "mouseClick" },
            write: {
                onMouseEvent: {
                    "class": "OnMouseClick"
                }
            }
        },
        {
            qualifier: { mouseEvent: "mouseDoubleClick" },
            write: {
                onMouseEvent: {
                    "class": "OnMouseDoubleClick"
                }
            }
        },
        {
            qualifier: { mouseEvent: "mouseUp" },
            write: {
                onMouseEvent: {
                    "class": "OnMouseUp"
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Do nothing other than provide an upon handler for the MouseDown/Up/Click/DoubleClick/Move.
    // By default all events are blocked. Inheriting class can let certain types of events through by turning their corresponding flag to false.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BlockMouseEvent: o(
        { // variant-controller
            qualifier: "!",
            context: {
                blockMouseDown: true,
                blockMouseDoubleClickExpired: true,
                // only an area that receives a MouseClick (a subtype of MouseUp) can receive a mouseDoubleClickExpiredEvent! (see thread for bug #1904)
                blockMouseUp: [{ blockMouseDoubleClickExpired: _ }, [me]],
                blockMouseClick: [{ blockMouseDoubleClickExpired: _ }, [me]],
                blockMouseDoubleClick: [{ blockMouseDoubleClickExpired: _ }, [me]]
            }
        },
        {
            qualifier: { blockMouseDown: true },
            write: {
                onBlockMouseEventMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        continuePropagation: false
                    }
                }
            }
        },
        {
            qualifier: { blockMouseUp: true },
            write: {
                onBlockMouseEventMouseUp: {
                    "class": "OnMouseUp",
                    true: {
                        continuePropagation: false
                    }
                }
            }
        },
        {
            qualifier: { blockMouseClick: true },
            write: {
                onBlockMouseEventMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        continuePropagation: false
                    }
                }
            }
        },
        {
            qualifier: { blockMouseDoubleClick: true },
            write: {
                onBlockMouseEventMouseDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        continuePropagation: false
                    }
                }
            }
        },
        {
            qualifier: { blockMouseDoubleClickExpired: true },
            write: {
                onBlockMouseEventMouseDoubleClickExpired: {
                    "class": "OnMouseDoubleClickExpired",
                    true: {
                        continuePropagation: false
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnEnter: {
        upon: enterEvent,
        true: {
            continuePropagation: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnCtrlEnter: {
        upon: ctrlEnterEvent,
        true: {
            continuePropagation: false
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnNoCtrlEnter: {
        upon: noCtrlEnterEvent
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnEsc: {
        upon: escEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnDel: {
        upon: delEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnBackspace: {
        upon: backspaceEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnHome: {
        upon: homeEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftHome: {
        upon: shiftHomeEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnEnd: {
        upon: endEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftEnd: {
        upon: shiftEndEvent
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnLeftArrow: {
        upon: leftArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftLeftArrow: {
        upon: shiftLeftArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnRightArrow: {
        upon: rightArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftRightArrow: {
        upon: shiftRightArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnShiftTabOrLeftArrow: {
        upon: shiftTabOrLeftArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnTabOrRightArrow: {
        upon: tabOrRightArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnUpArrow: {
        upon: upArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnDownArrow: {
        upon: downArrowEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnPageUp: {
        upon: pageUpEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnPageDown: {
        upon: pageDownEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnUpWheel: {
        upon: upWheelEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnDownWheel: {
        upon: downWheelEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnDownArrowOrWheel: {
        upon: o(
            downArrowEvent,
            downWheelEvent
        ),
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnUpArrowOrWheel: {
        upon: o(
            upArrowEvent,
            upWheelEvent
        ),
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnRightArrowOrWheel: {
        upon: o(
            rightArrowEvent,
            downWheelEvent
        ),
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnLeftArrowOrWheel: {
        upon: o(
            leftArrowEvent,
            upWheelEvent
        ),
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnKeyboardScroll: {
        upon: keyboardScrollEvent,
        true: {
            continuePropagation: false
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    OnAnyKeyUp: {
        upon: anyKeyUp
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of I/O related Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Area-in-focus Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls which area within a specified os of areaRefs will have the keyboard focus.
    // 
    // API: 
    // 1. osOfAreasInFocus: an os of areaRefs inheriting AreaInFocus. 
    //    One of these areas, at most, can have the keyboard focus. The focus will be moved across areas in this os in a circular fashion.
    // 2. areaInFocusControllerActivated: writable reference. its appData is true, by default. 
    //    May be turned off when another controller takes command.
    // 3. allowShiftingFocus: boolean, defaultAllowShiftingFocus by default. 
    //    Inheriting classes may override (e.g. UploadDataSourceModalDialog when has invalid input).
    //    defaultAllowShiftingFocus: true if there are no TextInput areas in editInputText mode.
    // 4. defaultAreaInFocus: an areaRef within the osOfAreasInFocus which will serve as the first area inFocus. default [first, osOfAreasInFocus].
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AreaInFocusController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*areaInFocusControllerActivated": true,
                allowShiftingFocus: [{ defaultAllowShiftingFocus: _ }, [me]],
                theOtherAreaInFocusControllerActivated: [
                    { areaInFocusControllerActivated: true },
                    [
                        n([me]),
                        [areaOfClass, "AreaInFocusController"]
                    ]
                ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                // osOfAreasInFocus: provided by inheriting class
                defaultAreaInFocus: [first, [{ osOfAreasInFocus: _ }, [me]]],
                defaultAllowShiftingFocus: [not, [{ editInputText: _ }, [areaOfClass, "TextInput"]]],

                "*areaInFocusAppState": o(), // initial value
                areaInFocus: [mergeWrite,
                    [{ areaInFocusAppState: _ }, [me]],
                    [{ defaultAreaInFocus: _ }, [me]]
                ]
            },
            write: {
                onAreaInFocusControllerActivated: {
                    upon: [{ areaInFocusControllerActivated: _ }, [me]],
                    // true: see variant below
                    false: { // note: false clause!
                        setAreaInFocusToDefault: {
                            to: [{ areaInFocusAppState: _ }, [me]],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { theOtherAreaInFocusControllerActivated: true },
            write: {
                onAreaInFocusControllerActivated: {
                    // upon: see default above
                    true: {
                        deactivateOtherControllers: {
                            to: [{ theOtherAreaInFocusControllerActivated: { areaInFocusControllerActivated: _ } }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                areaInFocusControllerActivated: true,
                allowShiftingFocus: true
            },
            write: {
                moveFocusToPrev: {
                    "class": "OnShiftTabOrLeftArrow",
                    true: {
                        prev: {
                            to: [{ areaInFocus: _ }, [me]],
                            merge: [prevInCircularOS,
                                [{ osOfAreasInFocus: _ }, [me]],
                                [{ areaInFocus: _ }, [me]]
                            ]
                        }
                    }
                },
                moveFocusToNext: {
                    "class": "OnTabOrRightArrow",
                    true: {
                        next: {
                            to: [{ areaInFocus: _ }, [me]],
                            merge: [nextInCircularOS,
                                [{ osOfAreasInFocus: _ }, [me]],
                                [{ areaInFocus: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // An area inheriting this class should be part of an os of areas, each which could potentially have the keyboard focus. Such a set of areas is controlled by an instance of
    // AreaInFocusController.
    //
    // API:
    // 1. myAreaInFocusController: The areaRef of their AreaInFocusController
    // 2. on mouse event: "mouseDown" by default - the mouseEvent needed to make this area the areaInFocus. the default value of mouseEvent is inherited from MouseEventSwitch. 
    //    the inheriting class can add to the onMouseEvent handler.
    // 3. on Act: the Enter keyboard event is translated to an Act message that is sent to this class. the inheriting class should define what should be done on Act.
    // 4. onEnter: the inheriting area may define actions to be taken onEnter, typically when { iAmTheAreaInFocus: true }.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AreaInFocus: o(
        { // variant-controller
            qualifier: "!",
            context: {
                myAreaInFocusControllerActivated: [{ myAreaInFocusController: { areaInFocusControllerActivated: _ } }, [me]],
                iAmTheAreaInFocus: [and,
                    [{ iAmTheAreaInFocusInMyController: _ }, [me]],
                    [{ myAreaInFocusControllerActivated: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "BlockMouseEvent", "MouseEventSwitch"),
            context: {
                iAmTheAreaInFocusInMyController: [equal,
                    [me],
                    [{ myAreaInFocusController: { areaInFocus: _ } }, [me]]
                ]
            },
            write: {
                onMouseEvent: {
                    // upon: inherited via MouseEventSwitch
                    true: {
                        setMeAsAreaInFocus: {
                            to: [{ myAreaInFocusController: { areaInFocus: _ } }, [me]],
                            merge: [me]
                        }
                        // inheriting class may add additional sections here. 
                    }
                }
            }
        },
        {
            qualifier: { myAreaInFocusControllerActivated: false },
            write: {
                onMouseEvent: {
                    // upon: inherited via MouseEventSwitch
                    true: {
                        activateController: {
                            to: [{ myAreaInFocusControllerActivated: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Area-in-focus Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Control: {
        "class": o("GeneralArea", "BlockMouseEvent")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ControlModifiedPointer: {
        "class": o("Control", "ModifyPointerClickable")
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TooltipableControl: {
        "class": o("ControlModifiedPointer", "Tooltipable")
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class writes true to the 'tmd' (Took MouseDown) writable ref for the duration of the mouse being held down. 
    // By default, this class does not propagate the MouseDown/MouseUp events - inheriting classes may override this value.
    //
    // API:
    // 1. tmdableWithCtrl: "notDefined" by default, which means that tmd is indifferent to the presence of a Ctrl modifier in the MouseDown.
    //    If true, tmd is set to true only on MouseDown+Ctrl. If false, tmd is set to true only on MouseDown without Ctrl!
    // 2. tmdableWithShift: "notDefined" by default, which means that tmd is indifferent to the presence of a Shift modifier in the MouseDown.
    //    If true, tmd is set to true only on MouseDown+Shift. If false, tmd is set to true only on MouseDown without Shift!
    // There are consequently variants to handle the matrix of possible combinations. If/when the Alt modifier comes into play, these will be expanded further..
    // Note that since "notDefined" is evaluated as truthy, we need to distinguish between it and an actual true value. We do that with the tmdableWithCtrlDefined / tmdableWithShiftDefined
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Tmdable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "*tmd": false,
                tmdableContinuePropagation: false, // by default, an event handled is no longer propagated, unless continuePropagation is set to true.
                // note that if an event is handled by multiple handlers in an area, only if all of them state 
                // continuePropagation: true will it continue its propagation!
                tmdableWithCtrl: "notDefined",
                tmdableWithShift: "notDefined",

                tmdableWithCtrlDefined: [and,
                    [{ tmdableWithCtrl: _ }, [me]], // i.e should be truthy, e.g. true
                    [notEqual,                     // and should be different from the default "notDefined"
                        [{ tmdableWithCtrl: _ }, [me]],
                        "notDefined"
                    ]
                ],
                tmdableWithShiftDefined: [and,
                    [{ tmdableWithShift: _ }, [me]], // i.e should be truthy, e.g. true
                    [notEqual,                      // and should be different from the default "notDefined"
                        [{ tmdableWithShift: _ }, [me]],
                        "notDefined"
                    ]
                ]
            }
        },
        { // default
            "class": "GeneralArea"
        },
        {
            qualifier: { tmd: false },
            write: {
                onTmdableMouseDown: {
                    // upon: - see variants below
                    true: {
                        tmd: {
                            to: [{ tmd: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { tmdableContinuePropagation: true },
            write: {
                onTmdableMouseDown: {
                    true: {
                        continuePropagation: true
                    }
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: "notDefined",
                tmdableWithShift: "notDefined"
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrlDefined: true,
                tmdableWithShiftDefined: true
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnShiftCtrlMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: false,
                tmdableWithShift: false
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnNoShiftNoCtrlMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrlDefined: true,
                tmdableWithShift: false
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnCtrlNoShiftMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: false,
                tmdableWithShiftDefined: true
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnShiftNoCtrlMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: "notDefined",
                tmdableWithShiftDefined: true
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnShiftMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: "notDefined",
                tmdableWithShift: false
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnNoShiftMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrlDefined: true,
                tmdableWithShift: "notDefined"
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnCtrlMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: {
                tmd: false,
                tmdableWithCtrl: false,
                tmdableWithShift: "notDefined"
            },
            write: {
                onTmdableMouseDown: {
                    "class": "OnNoCtrlMouseDown"
                    // true object - see variant above
                }
            }
        },
        {
            qualifier: { tmd: true },
            write: {
                onTmdableMouseUp: {
                    upon: o(
                        anyMouseUpEvent,
                        [not, [{ myApp: { pointerWithinBrowser: _ } }, [me]]]
                    ),
                    true: {
                        tmd: {
                            to: [{ tmd: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Not clear whether this class needs to be inherited by anyone other than App: it stores this bit, of tkd, for all areas to use.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Tkdable: o(
        { // default
            context: {
                "*tkd": false // tkd: Took Key Down
            }
        },
        {
            qualifier: { tkd: false },
            write: {
                onTkdableScrollKeyDown: {
                    "class": "OnKeyboardScroll",
                    true: {
                        raiseTkd: {
                            to: [{ tkd: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { tkd: true },
            write: {
                onTkdableAnyKeyUp: {
                    upon: o(
                        anyKeyUp,
                        anyMouseDownEvent
                    ),
                    true: {
                        lowerTkd: {
                            to: [{ tkd: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Draggable Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows the inheriting area to be dragged on the vertical and/or the horizontal axis.
    // It inherits Operationable.
    //
    // Note the distinction between 'tmd' and 'dragged':
    // 'tmd' (Took Mouse Down) is, as the name suggests, the area that took the mouseDown event. it is typically the area being 'dragged', but not always. 
    // for example, see NecklaceBead, where any bead can tmd, but the recording of stability is done only for one bead (and its definition of 'dragged' overrides the default
    // definition provided by Draggable).
    //
    // API: 
    // 1. tmdAppData: should this class inherit Tmdable, which defines tmd appData and the appropriate mouseEvent handlers, or not. default: true.
    //    If set to false, the inheriting class should provide a writable reference to dragged.
    // 2. verticallyDraggable/horizontallyDraggable: true, by default (dragging on both axes is permitted)
    // 3. draggingPriority: stronger than the default positioning constraint priority, by default.
    // 4. dragged: is this area being dragged. by default, takes the value of tmd (see NecklaceBead for an example of a different definition).
    // 5. draggableVerticalAnchor/draggableHorizontalAnchor: posPoints of the Draggable area whose offset from the mouse we fix while dragging. top/left by default. 
    // 6. draggableStable: will this area remember its position on mouseUp and stay there. false, by default.
    //    if true then this class also expects: 
    // 6.1 recordStableX/recordStableY: boolean flags determining whether to record the stableX/stableY. by default: equal to horizontallyDraggable/verticallyDraggable. 
    // 6.2 draggableInitialX/draggableInitialY, which will be used to initialize stableX/stableY when initializeStableDraggable is set to true.
    // 7. attachVerticalToPointerOnDrag/attachHorizontalToPointerOnDrag: during drag, should this class apply the positioning attachment to the pointer.
    //    true, by default (see MinimizedFacet for counter-example).
    // 8. maxOffsetDraggableHorizontalAnchorFromNormalizedPointer/maxOffsetDraggableVerticalAnchorFromNormalizedPointer: undefined, by default.
    //    Inheriting class may define these to limit the offset *in effect* between the mouse and the anchor. 
    //    Example of use: when dragging a minimized facet which expands into a very lean expanded facet, we want the horizontal offset from the mouse not to
    //    be the offset recorded when we started dragging (the rather wide) minimized facet, as that would mean the pointer is dragging an expanded facet
    //    that seems to hang in mid-air. by specifying maxOffsetDraggableHorizontalAnchorFromNormalizedPointer to be the width of the expanded facet, we 
    //    effectively place the dragged expanded facet right next to the pointer.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Draggable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tmdAppData: true,
                verticallyDraggable: true,
                horizontallyDraggable: true,
                draggableStable: false,
                dragged: [{ tmd: _ }, [me]],
                mouseIsDown: mouseDownEvent,
                attachVerticalToPointerOnDrag: true,
                attachHorizontalToPointerOnDrag: true
                // continuePropagation: via Tmdable inheritance             
            }
        },
        {
            "class": o("GeneralArea", "Operationable"),
            context: {
                draggingPriority: 0,

                // Operationable param
                myOperationInProgress: [{ dragged: _ }, [me]]
            }
        },
        {
            qualifier: { tmdAppData: true },
            "class": "Tmdable"
        },
        {
            qualifier: { verticallyDraggable: true },
            context: {
                draggableVerticalAnchor: { type: "top" },
                normalizedVerticalPointer: { element: [pointer], type: "top" },
                recordVerticalOffsetFromNormalizedPointer: true,
                maxOffsetDraggableVerticalAnchorFromNormalizedPointer: o(),
                "*offsetOfDraggableVerticalAnchorFromNormalizedPointer": 0 // the position of the pointer where the MouseDown took place is stored in this appData variable
            },
            write: {
                onDraggableDraggedY: {
                    upon: [and,
                        [{ recordVerticalOffsetFromNormalizedPointer: _ }, [me]],
                        [{ mouseIsDown: _ }, [me]]
                    ],
                    true: {
                        continuePropagation: true,
                        writeY: {
                            to: [{ offsetOfDraggableVerticalAnchorFromNormalizedPointer: _ }, [me]],
                            merge: [offset,
                                [{ draggableVerticalAnchor: _ }, [me]],
                                [{ normalizedVerticalPointer: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: { horizontallyDraggable: true },
            context: {
                draggableHorizontalAnchor: { type: "left" },
                normalizedHorizontalPointer: { element: [pointer], type: "left" },
                recordHorizontalOffsetFromNormalizedPointer: true,
                maxOffsetDraggableHorizontalAnchorFromNormalizedPointer: o(),
                "*offsetOfDraggableHorizontalAnchorFromNormalizedPointer": 0 // the position of the pointer where the MouseDown took place is stored in this appData variable
            },
            write: {
                onDraggableDraggedX: {
                    upon: [and,
                        [{ recordHorizontalOffsetFromNormalizedPointer: _ }, [me]],
                        [{ mouseIsDown: _ }, [me]]
                    ],
                    true: {
                        continuePropagation: true,
                        writeX: {
                            to: [{ offsetOfDraggableHorizontalAnchorFromNormalizedPointer: _ }, [me]],
                            merge: [offset,
                                [{ draggableHorizontalAnchor: _ }, [me]],
                                [{ normalizedHorizontalPointer: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                attachVerticalToPointerOnDrag: true,
                verticallyDraggable: true,
                dragged: true
            },
            position: {
                topDrag: {
                    point1: [{ draggableVerticalAnchor: _ }, [me]],
                    point2: [{ normalizedVerticalPointer: _ }, [me]],
                    equals: [min,
                        [{ offsetOfDraggableVerticalAnchorFromNormalizedPointer: _ }, [me]],
                        [{ maxOffsetDraggableVerticalAnchorFromNormalizedPointer: _ }, [me]]
                    ],
                    priority: [{ draggingPriority: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                attachHorizontalToPointerOnDrag: true,
                horizontallyDraggable: true,
                dragged: true
            },
            position: {
                leftDrag: {
                    point1: [{ draggableHorizontalAnchor: _ }, [me]],
                    point2: [{ normalizedHorizontalPointer: _ }, [me]],
                    equals: [min,
                        [{ offsetOfDraggableHorizontalAnchorFromNormalizedPointer: _ }, [me]],
                        [{ maxOffsetDraggableHorizontalAnchorFromNormalizedPointer: _ }, [me]]
                    ],
                    priority: [{ draggingPriority: _ }, [me]]
                }
            }
        },
        // the { draggableStable: true } variants: 
        {
            qualifier: { draggableStable: true },
            context: {
                "^initializeStableDraggable": true,
                recordStableY: [{ verticallyDraggable: _ }, [me]],
                recordStableX: [{ horizontallyDraggable: _ }, [me]],
                draggableVerticalAnchor: { type: "top" },
                draggableHorizontalAnchor: { type: "left" }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableY: true
            },
            context: {
                "^stableY": 0
            },
            write: {
                onDraggableStableInitialize: {
                    upon: [{ initializeStableDraggable: _ }, [me]],
                    true: {
                        intializeY: {
                            to: [{ stableY: _ }, [me]],
                            merge: [{ draggableInitialY: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableX: true
            },
            context: {
                "^stableX": 0
            },
            write: {
                onDraggableStableInitialize: {
                    upon: [{ initializeStableDraggable: _ }, [me]],
                    true: {
                        intializeX: {
                            to: [{ stableX: _ }, [me]],
                            merge: [{ draggableInitialX: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableY: true,
                dragged: false
            },
            position: {
                verticalDraggableStabiity: {
                    point1: { element: [areaOfClass, "ScreenArea"], type: "top" },
                    point2: [{ draggableVerticalAnchor: _ }, [me]],
                    equals: [{ stableY: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableX: true,
                dragged: false
            },
            position: {
                horizontalDraggableStability: {
                    point1: { element: [areaOfClass, "ScreenArea"], type: "left" },
                    point2: [{ draggableHorizontalAnchor: _ }, [me]],
                    equals: [{ stableX: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableY: true,
                dragged: true
            },
            write: {
                onDraggableStableAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        setStableY: {
                            to: [{ stableY: _ }, [me]],
                            merge: [offset,
                                {
                                    element: [areaOfClass, "ScreenArea"],
                                    type: "top"
                                },
                                [{ draggableVerticalAnchor: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                draggableStable: true,
                recordStableX: true,
                dragged: true
            },
            write: {
                onDraggableStableAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        setStableX: {
                            to: [{ stableX: _ }, [me]],
                            merge: [offset,
                                {
                                    element: [areaOfClass, "ScreenArea"],
                                    type: "left"
                                },
                                [{ draggableHorizontalAnchor: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides Draggable's functionality, albeit with a weak mouse attachment (lower than the default positioning constraint priority).
    // The inheriting class must ensure that on when being dragged the positioning constraints otherwise anchoring the area are removed (these are assumed to have a higher priority
    // than positioningPrioritiesConstants.mouseAttachment).
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableWeakMouseAttachment: {
        "class": "Draggable",
        context: {
            draggingPriority: positioningPrioritiesConstants.mouseAttachment
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class allows a given posPoint to be dragged within limits on a single axis (vertical/horizontal). 
    // It inherits DraggableWeakMouseAttachment. 
    //
    // API: 
    // 1. boundedDragPoint posPoint
    // 2. boundedDragBeginning posPoint
    // 3. boundedDragEnd posPoint
    // 4. offsetFromBoundary: 0, by default
    //
    // Note: This class can handle a bounded drag for one axis only. Another area must be used, to inherit another instance of this class, to bound drag on the orthogonal axis.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BoundedDraggable: {
        "class": "DraggableWeakMouseAttachment",
        context: {
            offsetFromBoundary: 0
        },
        position: {
            doNotExceedBeginning: {
                point1: [{ boundedDragBeginning: _ }, [me]],
                point2: [{ boundedDragPoint: _ }, [me]],
                min: [{ offsetFromBoundary: _ }, [me]]
            },
            doNotExceedEnd: {
                point1: [{ boundedDragPoint: _ }, [me]],
                point2: [{ boundedDragEnd: _ }, [me]],
                min: [{ offsetFromBoundary: _ }, [me]]
            }
        }
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class sets draggedMoved to true after a mouseDown that's followed by a movement of the pointer.
    // It inherits Draggable.
    // API:
    // 1. offsetQualifyingAsMoved: number of pixel offset to qualify the pointer movement as a draggedMoved. default provided.
    // 
    // Exports: 
    // 1. draggedMove: boolean. true during such a drag operation.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableOnMove: o(
        { // variant-controlled
            qualifier: "!",
            context: {
                "*draggedMoved": false
            }
        },
        { // default
            "class": "Draggable",
            context: {
                absXOfPointer: [offset,
                    { element: [areaOfClass, "ScreenArea"], type: "left" },
                    { element: [pointer], type: "left" }
                ],
                absYOfPointer: [offset,
                    { element: [areaOfClass, "ScreenArea"], type: "top" },
                    { element: [pointer], type: "top" }
                ],
                "*absXOfMouseDown": 0,
                "*absYOfMouseDown": 0,
                mouseDownNow: [and,
                    o(
                        [{ tmd: _ }, [me]],
                        mouseDownEvent
                    ),
                    [not, [{ type: "MouseUp" }, [message]]]
                ]
            },
            write: {
                onDraggableOnMoveMouseDown: {
                    "class": "OnMouseDown",
                    true: {
                        recordAbsX: {
                            to: [{ absXOfMouseDown: _ }, [me]],
                            merge: [{ absXOfPointer: _ }, [me]]
                        },
                        recordAbsY: {
                            to: [{ absYOfMouseDown: _ }, [me]],
                            merge: [{ absYOfPointer: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { tmd: true },
            write: {
                onDraggableOnMoveAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        recordAbsX: {
                            to: [{ absXOfMouseDown: _ }, [me]],
                            merge: 0
                        },
                        recordAbsY: {
                            to: [{ absYOfMouseDown: _ }, [me]],
                            merge: 0
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                mouseDownNow: true,
                draggedMoved: false
            },
            context: {
                offsetQualifyingAsMoved: 2,
                movedFollowingMouseDown: [and,
                    [{ myApp: { pointerWithinBrowser: _ } }, [me]], // only if the pointer is still inside the browser, to force letting go of the 
                    // dragged area when the pointer exits the browser, in mid dragging operation!
                    o(
                        // check that absXOfMouseDown/absYOfMouseDown are > 0
                        // to ensure that we've already gone through onDraggableOnMoveMouseDown above,
                        // where their values on the mouseDown were recorded.
                        [and,
                            [greaterThan,
                                [{ absXOfMouseDown: _ }, [me]],
                                0
                            ],
                            [greaterThan,
                                [abs,
                                    [minus,
                                        [{ absXOfMouseDown: _ }, [me]],
                                        [{ absXOfPointer: _ }, [me]]
                                    ]
                                ],
                                [{ offsetQualifyingAsMoved: _ }, [me]]
                            ]
                        ],
                        [and,
                            [greaterThan,
                                [{ absYOfMouseDown: _ }, [me]],
                                0
                            ],
                            [greaterThan,
                                [abs,
                                    [minus,
                                        [{ absYOfMouseDown: _ }, [me]],
                                        [{ absYOfPointer: _ }, [me]]
                                    ]
                                ],
                                [{ offsetQualifyingAsMoved: _ }, [me]]
                            ]
                        ]
                    )
                ]
            },
            write: {
                onDraggableOnMovePointerMoved: {
                    upon: [{ movedFollowingMouseDown: _ }, [me]],
                    true: {
                        setDraggedMoved: {
                            to: [{ draggedMoved: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { draggedMoved: true },
            write: {
                onDraggableOnMoveAnyMouseUp: {
                    "class": "OnAnyMouseUp",
                    true: {
                        lowerDraggedMoved: {
                            to: [{ draggedMoved: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableOnMoveWeakMouseAttachment: {
        "class": "DraggableOnMove",
        context: {
            draggingPriority: positioningPrioritiesConstants.mouseAttachment
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // When being dragged ({ tmd: true}), the handle inherits MinOffsetFromPointer.
    // API:
    // 1. dragOnMove: false, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    DragHandle: o(
        { // variant-controller
            qualifier: "!",
            context: {
                iAmIcon: false,
                dragOnMove: false
            }
        },
        { // default
            "class": o("ModifyPointerDraggable", "BlockMouseEvent", "Operationable"),
            context: {
                "*draggingFlag": false,
                // Operationable param
                myOperationInProgress: [{ draggingFlag: _ }, [me]]
            }
        },
        {
            qualifier: { tmd: true },
            "class": "ModifyPointerDragging",
        },
        {
            qualifier: { dragOnMove: false },
            "class": "DraggableWeakMouseAttachment",
            context: {
                tmd: [{ draggingFlag: _ }, [me]]
            }
        },
        {
            qualifier: { dragOnMove: true },
            "class": "DraggableOnMoveWeakMouseAttachment",
            context: {
                draggedMoved: [{ draggingFlag: _ }, [me]]
            }
        },
        {
            qualifier: { iAmIcon: true },
            "class": "Icon",
            context: {
                confineIconToArea: false // override default Icon value.
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Draggable Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Button Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The common functionality inherited by BiStateButton and by BroadcastButton.
    //
    // API:
    // 1. displayText: the text to be displayed on the button. 
    // 2. mouseEvent: mouseClick, by default. Can be any of the mouseEvents specified by MouseEventSwitch.
    // 3. blockMouseEvent: a boolean flag, true by default.
    // 4. enabled: boolean, true by default
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ButtonCore: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: true,
                mouseEvent: "mouseClick", // for MouseEventSwitch
                blockMouseEvent: true
            }
        },
        { // default
            "class": o("GeneralArea"/*, "ButtonDesign"*/)
        },
        {
            qualifier: { enabled: true },
            "class": o("MouseEventSwitch", "ModifyPointerClickable"),
        },
        {
            qualifier: {
                enabled: true,
                blockMouseEvent: true
            },
            "class": "BlockMouseEvent"
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is a button that can, upon taking the mouseEvent, send a message to recipient area(s).
    //
    // API:
    // 1. enabled: boolean. true, by default
    // 2. see ButtonCore's API.
    // 3. recipient: an os of areaRefs which will receive the message sent.
    // 4. message
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BroadcastButton: o(
        {
            qualifier: "!",
            context: {
                enabled: true
            }
        },
        { // default
            "class": o("ButtonCore"),
            context: {
                recipient: o(),
                message: "notDefined"
            }
        },
        {
            qualifier: { enabled: true },
            write: {
                onMouseEvent: { // handler name is part of Button's API (MouseEventSwitch, actually, inherited by Button)
                    // 'upon' provided by MouseEventSwitch
                    true: {
                        sendMessage: {
                            to: [message],
                            merge: {
                                msgType: [{ message: _ }, [me]],
                                recipient: [{ recipient: _ }, [me]]
                            }
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A button that maintains a binary state in its 'checked' writable reference.
    // 
    // API: 
    // 1. See ButtonCore's API
    // 2. checked: writable reference.  
    //    Associated appData is given a default value of false. Inheriting class may obviously point 'checked' to a different appData.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    BiStateButton: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^checked": false
            }
        },
        { // default
            "class": "ButtonCore",
            write: {
                onMouseEvent: { // handler name is part of Button's API (MouseEventSwitch, actually, inherited by Button)
                    // 'upon' provided by MouseEventSwitch
                    true: {
                        toggleChecked: {
                            to: [{ checked: _ }, [me]],
                            merge: [not, [{ checked: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. toggleUXWidth/toggleUXHeight
    // 2. toggleLabelTextSize: default provided
    // 3. toggleLeftLabelDisplayText / toggleRightLabelDisplayText
    // 4. selectedToggleLabelTextColor: default provided
    // 5. unselectedToggleLabelTextColor: default provided
    // 6. horizontalSpacingBetweenLabelsAndToggleUX: default provided. 
    // 7. leftSelected: a boolean pAD which indicates whether the left side or the right side are selected. default AD provided.
    // 8. initLeftSelected: boolean, for initializing the leftSelected. true, by default.
    //
    // Inheriting classes may refer to the 'responsive' context label (e.g. )
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleControl: {
        "class": o("GeneralArea", "MinWrap"),
        context: {
            minWrapAround: 0,
            initLeftSelected: true,
            "^leftSelected": [{ initLeftSelected: _ }, [me]],

            toggleUXWidth: [{ general: { toggleUXWidth: _ } }, [globalDefaults]],
            toggleUXHeight: [{ general: { toggleUXHeight: _ } }, [globalDefaults]],
            horizontalSpacingBetweenLabelsAndToggleUX: [{ general: { toggleHorizontalSpacingBetweenElements: _ } }, [globalDefaults]],
            toggleLabelTextSize: [densityChoice, [{ generalDesign: { textSize: _ } }, [globalDefaults]]],
            selectedToggleLabelTextColor: designConstants.baseFGColor,
            unselectedToggleLabelTextColor: [{ generalDesign: { disabledTextColor: _ } }, [globalDefaults]],

            myToggleUX: [{ children: { toggleUX: _ } }, [me]],
            responsive: [{ myToggleUX: { responsive: _ } }, [me]],

            hoverOverUX: [{ myToggleUX: { inFocus: _ } }, [me]],
            hoverOverLeftHalf: [{ myToggleUX: { hoverOverLeftHalf: _ } }, [me]]
        },
        children: {
            toggleLeftLabel: {
                description: {
                    "class": "ToggleLeftLabel"
                }
            },
            toggleUX: {
                description: {
                    "class": "ToggleControlUX"
                }
            },
            toggleRightLabel: {
                description: {
                    "class": "ToggleRightLabel"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleControlElement: {
        "class": "GeneralArea",
        position: {
            "vertical-center": 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. selected: a boolean.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleLabel: {
        "class": o("ToggleLabelDesign", "ToggleControlElement", "DisplayDimension"),
        context: {
            myToggleUX: [{ children: { toggleUX: _ } }, [embedding]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleLeftLabel: {
        "class": "ToggleLabel",
        context: {
            displayText: [{ toggleLeftLabelDisplayText: _ }, [embedding]],
            selected: [{ leftSelected: _ }, [embedding]]
        },
        position: {
            left: 0,
            attachRightToMyToggleUXLeft: {
                point1: { type: "right" },
                point2: {
                    element: [{ myToggleUX: _ }, [me]],
                    type: "left"
                },
                equals: [densityChoice, [{ horizontalSpacingBetweenLabelsAndToggleUX: _ }, [embedding]]]
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleRightLabel: {
        "class": "ToggleLabel",
        context: {
            displayText: [{ toggleRightLabelDisplayText: _ }, [embedding]],
            selected: [not, [{ leftSelected: _ }, [embedding]]]
        },
        position: {
            attachLeftToMyToggleUXRight: {
                point1: {
                    element: [{ myToggleUX: _ }, [me]],
                    type: "right"
                },
                point2: { type: "left" },
                equals: [densityChoice, [{ horizontalSpacingBetweenLabelsAndToggleUX: _ }, [embedding]]]
            },
            right: 0
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ToggleControlUX: o(
        { // variant-controller
            qualifier: "!",
            context: {
                responsive: o(
                    [and,
                        [{ leftSelected: _ }, [me]],
                        [not, [{ hoverOverLeftHalf: _ }, [me]]]
                    ],
                    [and,
                        [not, [{ leftSelected: _ }, [me]]],
                        [{ hoverOverLeftHalf: _ }, [me]]
                    ]
                )
            }
        },
        { // default
            "class": o("ToggleControlUXDesign", "ToggleControlElement"),
            context: {
                leftSelected: [{ leftSelected: _ }, [embedding]],
                hoverOverLeftHalf: [and,
                    [{ inFocus: _ }, [me]],
                    [greaterThan,
                        [offset,
                            { element: [pointer], type: "left" },
                            { element: [me], type: "horizontal-center" }
                        ],
                        0
                    ]
                ]
            },
            position: {
                width: [{ toggleUXWidth: _ }, [embedding]],
                height: [{ toggleUXHeight: _ }, [embedding]]
            }
        },
        {
            qualifier: { responsive: true },
            "class": "ControlModifiedPointer",
            write: {
                onToggleControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggle: {
                            to: [{ leftSelected: _ }, [me]],
                            merge: [not, [{ leftSelected: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A singleton radio button
    // API
    // 1. selected - writable reference (true/false)
    // 2. performWriteOnClick - if click is enabled (true by default)
    // 3. selectedWhenDisabled - default selected
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    BooleanButton: o(
        {
            // default
            "class": o("BooleanButtonDesign"),
            context: {
                // selected: provided by inheriting class                
                performWriteOnClick: true,
                selectedWhenDisabled: [{ selected: _ }, [me]]
            }
        },
        {
            qualifier: { performWriteOnClick: true },
            write: {
                onRadioButtonControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        selectMe: {
                            to: [{ selected: _ }, [me]],
                            merge: [not, [{ selected: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { performWriteOnClick: false },
            context: {
                selected: [{ selectedWhenDisabled: _ }, [me]]
            }
        }
    ),



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Button Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of RadioButton Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. radioButtonOptions. an os of uniqueIDs and the values that will be displayed to the user. format: { uniqueID: <>, displayText: <> }
    // 2. defaultRadioButtonUniqueID (default: the first radioButtonOptions' uniqueID)
    // 3. radioButtonSelection: appData of the selection made. Can be used as a writable reference, if appData is stored elsewhere.
    // 4. inheriting class should provide the description section for the buttons children areaSet. Areaset class inherits RadioButton.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RadioButtonController: {
        "class": o("GeneralArea", "MinWrap"),
        context: {
            uniqueIDOfFirstOption: [{ uniqueID: _ }, [pos, 0, [{ radioButtonOptions: _ }, [me]]]],
            defaultRadioButtonUniqueID: [{ uniqueID: _ }, [pos, 0, [{ radioButtonOptions: _ }, [me]]]],
            "^radioButtonSelection": [{ defaultRadioButtonUniqueID: _ }, [me]],
            minWrapAround: 3
        },
        children: {
            buttons: {
                data: [{ radioButtonOptions: _ }, [me]],
                description: {
                    "class": "RadioButton"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. radioButtonController. default: embedding
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RadioButton: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selected: [equal,
                    [{ uniqueID: _ }, [me]],
                    [{ radioButtonController: { radioButtonSelection: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrap", "MemberOfTopToBottomAreaOS"),
            context: {
                uniqueID: [{ param: { areaSetContent: { uniqueID: _ } } }, [me]],
                displayText: [{ param: { areaSetContent: { displayText: _ } } }, [me]],
                minWrapAround: 0,
                radioButtonController: [embedding],

                // override MemberOfTopToBottomAreaOS default value
                spacingFromPrev: [densityChoice, designConstants.radioButtonControlSpacing]
            },
            position: {
                left: [{ minWrapAround: _ }, [embedding]],
                right: [{ minWrapAround: _ }, [embedding]]
                // vertical position determined by MemberOfTopToBottomAreaOS
            },
            children: {
                control: {
                    description: {
                        "class": "RadioButtonControl"
                    }
                },
                name: {
                    description: {
                        "class": "RadioButtonName"
                    }

                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API
    //  1. performWriteOnClick to perform the write (default true)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RadioButtonElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selected: [{ selected: _ }, [embedding]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                uniqueID: [{ uniqueID: _ }, [embedding]],
                radioButtonController: [{ radioButtonController: _ }, [embedding]],
                performWriteOnClick: true
            },
            position: {
                "vertical-center": 0
            }
        },
        {
            qualifier: { selected: false, performWriteOnClick: true },
            write: {
                onRadioButtonControlClick: {
                    "class": "OnMouseClick",
                    true: {
                        selectMe: {
                            to: [{ radioButtonController: { radioButtonSelection: _ } }, [me]],
                            merge: [{ uniqueID: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. selected: a boolean.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RadioButtonControl: {
        "class": o("RadioButtonControlDesign", "RadioButtonElement"),
        position: {
            left: 0
            // vertical position - by RadioButtonElement
            // width/height determined via Circle, inherited by RadioButtonControlDesign
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    RadioButtonName: {
        "class": o("RadioButtonNameDesign", "DisplayDimension", "RadioButtonElement"),
        context: {
            displayText: [{ displayText: _ }, [embedding]]
        },
        position: {
            "vertical-center": 0,
            attachToControlRight: {
                point1: {
                    element: [{ children: { control: _ } }, [embedding]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 2
            }
            // width/height determined via DisplayDimension
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of RadioButton Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. defaultHeight/defaultWidth: default values provided
    // 2. dimensionDefinesContent: boolean, true by default. relevant only if defaultHeight/defaultWidth is true.
    //    if false, then the dimension defines the frame.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                defaultWidth: true,
                defaultHeight: true,
                dimensionDefinesContent: true
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                dimension: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: {
                defaultHeight: true,
                dimensionDefinesContent: true
            },
            position: {
                "content-height": [{ dimension: _ }, [me]]
            }
        },
        {
            qualifier: {
                defaultWidth: true,
                dimensionDefinesContent: true
            },
            position: {
                "content-width": [{ dimension: _ }, [me]]
            }
        },
        {
            qualifier: {
                defaultHeight: true,
                dimensionDefinesContent: false
            },
            position: {
                height: [{ dimension: _ }, [me]]
            }
        },
        {
            qualifier: {
                defaultWidth: true,
                dimensionDefinesContent: false
            },
            position: {
                width: [{ dimension: _ }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited for example by FacetStateControl, FacetSorterUX, FacetMinimizationControl: controls embedded in the facet.
    // API:
    // 1. see AppElement
    // 2. tooltipable: will this class inherit Tooltipable. default: true
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AppControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tooltipable: true,
                enabled: true
            }
        },
        { // default
            "class": o("AppElement", "AboveSiblings")
        },
        {
            qualifier: { tooltipable: true },
            "class": "Tooltipable"
        },
        {
            qualifier: { enabled: true },
            "class": "ControlModifiedPointer"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. isOpen: (AD) whether the controller is open (if true, the triangle points upwards)
    // 2. tooltipTextWhenOpened: text of the tooltip when the controller is open 
    // 3. tooltipTextWhenClosed: text of the tooltip when the controller is closed
    // 4. size // default set by globalDefaults
    // 5. triangleWidth // default set by globalDefaults
    // 6. triangleHeight // default set by globalDefaults
    // 7. embedInCircle // whether to have a circle with background color around the triangle (true by default)
    // 8. activeController // whether to have this area actively controls the 'isOpen' AD (true by default)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TriangleExpansionController: o(
        {   //variant-controller
            qualifier: "!",
            context: {
                embedInCircle: true,
                activeController: true
            }
        },
        {   //default
            "class": o("TriangleExpansionControllerDesign", "GeneralArea"),
            context: {
                minWrapAround: 0,
                isOpen: [{ expansionControllerIsOpen: _ }, [embedding]],
                size: [densityChoice, [{ fsAppPosConst: { expansionControllerDefaultSize: _ } }, [globalDefaults]]],
                // Triangle proprieties
                triangleSize: [densityChoice, [{ fsAppPosConst: { expansionControllerDefaultTriangleSize: _ } }, [globalDefaults]]],
                trianleBaseSide: [cond,
                    [{ isOpen: _ }, [me]],
                    o(
                        { on: true, use: "bottom" },
                        { on: false, use: "top" }
                    )
                ],
            },
            children: {
                triangle: {
                    description: {
                        "class": "Triangle",
                        context: {
                            // Triangle params
                            width: [{ triangleSize: _ }, [embedding]],
                            height: [{ triangleSize: _ }, [embedding]],
                            baseSide: [{ trianleBaseSide: _ }, [embedding]],
                            triangleColor: [{ triangleColor: _ }, [embedding]], // in TriangleExpansionControllerDesign
                        },
                        position: {
                            "vertical-center": [cond,
                                [{ isOpen: _ }, [embedding]],
                                o({ on: true, use: -1 }, { on: false, use: 1 })
                            ],
                            "horizontal-center": 0,
                        }
                    }
                }
            },

        },
        {
            qualifier: { embedInCircle: true },
            "class": "Circle",
            context: {
                // Circle params
                radius: [div, [{ size: _ }, [me]], 2],
            }
        },
        {
            qualifier: { embedInCircle: false },
            position: {
                // Circle params
                width: [{ size: _ }, [me]],
                height: [{ size: _ }, [me]]
            }
        },
        {
            qualifier: { activeController: true },
            "class": "TooltipableControl",
            context: {
                tooltipText: [cond,
                    [{ isOpen: _ }, [me]],
                    o(
                        { on: true, use: [{ tooltipTextWhenOpened: _ }, [me]] },
                        { on: false, use: [{ tooltipTextWhenClosed: _ }, [me]] }
                    )
                ],
            },
            write: {
                onExpansionControllerMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleKeypadDisplayControl: {
                            to: [{ isOpen: _ }, [me]],
                            merge: [not, [{ isOpen: _ }, [me]]]
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. hoveringOverTrash
    // 2. Inheriting classes should define actions in their onTrashAnyMouseUp, to complement the upon defined herein (OnAnyMouseUp)
    // 3. the *Design of the inheriting class will likely want to inherit TrashDesign    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    Trash: {
        "class": o("GeneralArea", "AppElement", "BlockMouseEvent"),
        write: {
            onTrashAnyMouseUp: {
                upon: [and,
                    [{ hoveringOverTrash: _ }, [me]],
                    anyMouseUpEvent
                ]
                // actions to be defined by inheriting classes
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. draggingToTrash: boolean, true when being dragged. To be provided by inheriting classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggableToTrashElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hoveringOverTrash: [{ appTrash: { hoveringOverTrash: _ } }, [me]],
                iAmHoveringOverTrash: [and,
                    [{ draggingToTrash: _ }, [me]],
                    [{ hoveringOverTrash: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea", "ModalDialogableOnDragAndDrop", "TrackAppTrash"),
            context: {
                // ModalDialogableOnDragAndDrop params
                conditionsForModalDialogable: [{ iAmHoveringOverTrash: _ }, [me]]
            }
        },
        {
            qualifier: { draggingToTrash: true },
            stacking: {
                aboveAppTrash: {
                    higher: [me],
                    lower: [{ appTrash: _ }, [me]]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of DropSite Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class that wants to give a visual indication that it's a valid drop site when being hovered over (a "visual match") should inherit this class.
    // Typically the inheritance would be in a variant of the inheriting class that indicates a "logical match" (i.e. the element being dragged is allowed to be dropped into it).
    // This class is the expression parent of the DropSiteFrame, which inherits Icon - this allows the DropSiteFrame to match the outer frame of DropSite (otherwise it would be limited to
    // its content frame!).
    // 
    // API: 
    // 1. dropSiteZBottomOfLayer/dropSiteZTopOfLayer: o() by default. Define the z-index of the associated DropSiteFrame. Specify by using atomic({ <z-point> }).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropSite: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inAreaAppInAction: [and,
                    [{ inArea: _ }, [me]],
                    [{ myApp: { inAction: _ } }, [me]]
                ]
            }
        },
        { // default
            "class": o("GeneralArea"),
            context: {
                dropSiteZBottomOfLayer: o(),
                dropSiteZTopOfLayer: o()
            }
        },
        {
            qualifier: { inAreaAppInAction: true },
            children: {
                dropSiteFrame: {
                    "class": "PartnerWithIconEmbedding", // DropSiteFrame inherits Icon, and so we need to provide a partner definition here.
                    description: {
                        "class": "DropSiteFrame"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides a visual frame to mark that its expressionOf, DropSite, is a valid target for a drop operation.
    // This class obtains dropSiteZBottomOfLayer/dropSiteZTopOfLayer from its DropSite, to the extent these z-index labels are defined, and uses those to position itself z-wise, properly.
    // It inherits:
    // 1. Border: to provide the visual frame
    // 2. MatchArea to match the dimensions of its expressionOf DropSite.
    // 3. Icon: to allow it to be embedded in IconEmbedding (ScreenArea), and thereby not be clipped by the content frame of DropSite.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DropSiteFrame: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dropSiteZBottomOfLayerDefined: [{ dropSiteZBottomOfLayer: _ }, [expressionOf]],
                dropSiteZTopOfLayerDefined: [{ dropSiteZTopOfLayer: _ }, [expressionOf]]
            }
        },
        {
            "class": o("Border", "Icon", "MatchArea"),
            context: {
                match: [expressionOf] // the DropSite class
            },
            stacking: { // We want to make sure that we're below the other icons - specifically the one being dropped onto the DropSite.
                belowIconBeingDropped: {
                    higher: [areaOfClass, "IconAboveAppZTop"],
                    lower: [me]
                }
            }
        },
        {
            qualifier: { dropSiteZBottomOfLayerDefined: true },
            stacking: {
                // sandwich [me] above its expressionOf's dropSiteZBottomOfLayer
                aboveZBottomOfLayer: {
                    higher: [me],
                    lower: [{ dropSiteZBottomOfLayer: _ }, [expressionOf]]
                }
            }
        },
        {
            qualifier: { dropSiteZTopOfLayerDefined: true },
            stacking: {
                // sandwich [me] below its expressionOf's dropSiteZTopOfLayer
                belowZTopOfLayer: {
                    higher: [{ dropSiteZTopOfLayer: _ }, [expressionOf]],
                    lower: [me]
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of DropSite Classes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of CollapsableView Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. collapsableViewInitiallyOpen: false, by default
    // 2. collapsableViewOpen: an areaRef to the viewing state of the collapsable view. appData provided, initialized to collapsableViewInitiallyOpen
    // 3. collapsableViewClosedText: the text to display to the right of the control, when the view is collapsed. by default, no text is displayed.
    // 4. the inheriting class should provide the positioning for the area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CollapsableView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^collapsableViewOpen": [{ collapsableViewInitiallyOpen: _ }, [me]],
                displayTextWhenViewCollapsed: [{ collapsableViewClosedText: _ }, [me]]
            }
        },
        { // default
            context: {
                collapsableViewInitiallyOpen: false
            },
            children: {
                control: {
                    description: {
                        "class": "CollapsableViewControl"
                    }
                }
            }
        },
        {
            qualifier: {
                collapsableViewOpen: false,
                displayTextWhenViewCollapsed: true
            },
            write: {
                // when the view is closed, clicking anywhere on it, opens it up (and not only when clicking on its control)
                onCollapsableViewMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        openCollapsableView: {
                            to: [{ collapsableViewOpen: _ }, [me]],
                            merge: true
                        }
                    }
                }
            },
            children: {
                textWhenCollapsed: {
                    description: {
                        "class": o("TextWhenViewCollapsedDesign", "GeneralArea", "EmbeddedInCollapsableView"),
                        context: {
                            displayText: [{ collapsableViewClosedText: _ }, [embedding]]
                        },
                        position: {
                            top: 0,
                            bottom: 0,
                            right: 0
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class inherits CollapsableView, and allows for the scrolling of a document embedded in it.
    // API:
    // 1. See CollapsableView API.
    // 2. Embed a child which inherits DocInCollapsableView.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CollapsableViewWithScrollableDocument: o(
        { // default
            "class": "CollapsableView",
            context: {
                myDocInCollapsableView: [
                    [areaOfClass, "DocInCollapsableView"],
                    [embedded, [me]]
                ]
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            "class": o("VerticalContMovableController"),
            context: {
                beginningOfDocPoint: {
                    element: [{ myDocInCollapsableView: _ }, [me]],
                    type: "top"
                },
                endOfDocPoint: {
                    element: [{ myDocInCollapsableView: _ }, [me]],
                    type: "bottom"
                }
            },
            children: {
                scrollbar: {
                    description: {
                        "class": "VerticalScrollbarContainer",
                        context: {
                            movableController: [embedding],
                            attachToView: "end", // the beginning side is taken up by the collapsable view's open/close control
                            attachToViewOverlap: true,
                            createButtons: false
                        },
                        position: {
                            top: 0,
                            bottom: 0
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayDebugObj: the object that serves as the document (via DebugDisplay).
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DocInCollapsableView: {
        "class": o("GeneralArea", "EmbeddedInCollapsableView", "DraggableMovable"),
        context: {
            // Movable Param: 
            movableController: [embedding]
        },
        position: {
            // left provided by EmbeddedInCollapsableView
            right: 0
            // top provided by Movable/MovableController
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyCollapsableView: o(
        { // variant-controller
            qualifier: "!",
            context: {
                collapsableViewOpen: [{ myCollapsableView: { collapsableViewOpen: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myCollapsableView: [
                    [embeddingStar, [me]],
                    [areaOfClass, "CollapsableView"]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CollapsableViewControl: o(
        { // default
            "class": o("CollapsableViewDesign", "GeneralArea"),
            position: {
                left: 0,
                top: 2,
                width: 16,
                height: 16
            },
            write: {
                onCollapsableViewControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        toggleCollapsableViewOpen: {
                            to: [{ collapsableViewOpen: _ }, [me]],
                            merge: [not, [{ collapsableViewOpen: _ }, [me]]]
                        }
                    }
                }
            }
        },
        {
            qualifier: { collapsableViewOpen: true },
            context: {
                displayText: "-"
            }
        },
        {
            qualifier: { collapsableViewOpen: false },
            context: {
                displayText: "+"
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbeddedInCollapsableView: {
        "class": "TrackMyCollapsableView",
        position: {
            attachLeftToControl: {
                point1: {
                    element: [{ myCollapsableView: { children: { control: _ } } }, [me]],
                    type: "right"
                },
                point2: {
                    type: "left"
                },
                equals: 5
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of CollapsableView Classes 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EmbedInfoFrame: {
        children: {
            infoFrame: {
                description: {
                    "class": "InfoFrame"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InfoFrame: {
        "class": o("InfoFrameDesign", "GeneralArea"),
        position: {
            frame: 0
        },
        stacking: {
            higherPriorityAboveSiblings: {
                higher: [me],
                lower: [embedding],
                priority: 10 // to beat out the AboveSiblings class
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: the embedding area should provide:
    // 1. the text to be displayed in its context.displayText.
    // 2. text content width: if specified in textWidth (default definition provided), then that's the value used. otherwise, a displayQuery is used.
    // 3. this class expects a sibling to be an instance of IconInTextAndIcon
    // 4. horizontalMargin: 0, by default.
    // 5. defaultVerticalPositioning/defaultHorizontalPositioning: true by default.
    // 6. displayWidth: [displayWidth], by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TextInTextAndIcon: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                defaultVerticalPositioning: true,
                defaultHorizontalPositioning: true
            }
        },
        { // default
            "class": o("DefaultDisplayText", "GeneralArea"),
            context: {
                displayText: [{ displayText: _ }, [embedding]],
                myIcon: [
                    [embedded, [embedding]],
                    [areaOfClass, "IconInTextAndIcon"]
                ],
                horizontalMargin: 0,
                displayWidth: [displayWidth]
            },
            position: {
                "content-width": [{ displayWidth: _ }, [me]]
            }
        },
        {
            qualifier: { defaultVerticalPositioning: true },
            position: {
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { defaultHorizontalPositioning: true },
            position: {
                attachOnLeft: {
                    point1: [cond, // attempting for once to do this without orGroups, but rather with a cond on the existence of myIcon.
                        [{ myIcon: _ }, [me]],
                        o(
                            {
                                on: true,
                                use: {
                                    element: [{ myIcon: _ }, [me]],
                                    type: "right"
                                }
                            },
                            {
                                on: false,
                                use: {
                                    element: [embedding],
                                    type: "left"
                                }
                            }
                        )
                    ],
                    point2: {
                        type: "left"
                    },
                    equals: [{ horizontalMargin: _ }, [me]]
                },
                minRightMargin: {
                    point1: { type: "right" },
                    point2: { element: [embedding], type: "right" },
                    min: [{ horizontalMargin: _ }, [me]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: embedding area should provide:
    // 1. the image.src in its context.icon
    // 2. the width of the icon in its context.iconWidth - till display queries are available.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    IconInTextAndIcon: {
        "class": o("IconInTextAndIconDesign", "GeneralArea"),
        position: {
            top: 0,
            bottom: 0,
            left: 0,
            width: [{ iconWidth: _ }, [embedding]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A class that provides the ability to input its text from the keyboard. 
    // The input text can be accessed and written to at { param: { input: { value:_} } }.
    //
    // API
    // 1. mouseToEdit: true by default
    // 2. mouseEventToEdit: determine which action will activate the edit mode. "Click"/"DoubleClick"/"DoubleClickExpired"/"ClickExpired" ("Click" by default)
    // 3. placeholderInputText: default provided.
    // 4. inputAppData: a writable reference. initialized to initInputAppData, if provided. otherwise to placeholderInputText
    // 5. recordTextOnMouseDownOutsideMe: default value provided. how should a mouseDown outside the area inheriting TextInput be interpreted? as Enter or Esc?
    // 6. inputTextValuesAlreadyUsed: inheriting class may define os of values already used. If true, a popup with the text specified in the
    // 7. allowDuplicateValues: should the text input be allowed, if already being used (per inputTextAlreadyBeingUsed). false by default.
    // 8. immuneFromTurningOffEditInputOnMouseDown: os of areaRefs which can take a mouseDown without turning off the editInputText flag.
    // 9. allowToExitEditInputTextMode: should the UX be allowed to reset editInputText back to false. boolean, true by default.
    // 10. keyboardEventsToExitEditInputText: default provided (noCtrlEnterEvent). for example of overridding, see ModalDialogTextInputElement
    // 11. allowWritingInput: default values provided, per either value of allowDuplicateValues
    // 12. initEditInputText: false, by default. The initial value of the editInputText appData.
    // 13. rememberTextWasEdited: a boolean, false by default. when true, textWasEdited will be marked as true after the first time the text is edited.
    // 14. textWasEdited: a writable reference to persisted - i.e. ^ - appData. its persistence is important, as it is typically used to determine
    //     the value of initEditInputText, which is used to initialize editInputText, the latter being non-persisted appData.
    //     This allows things like a new overlay name to come up in edit mode the first time around, but not after the name's been accepted/modified once.
    // 15. displayDimensionOfStableText: false, by default. If true, when in editInputText mode, this area's width/height will be determined by its displayText 
    //     string, and *NOT* by the string being input by the user (i.e. by display.text.value, and not by display.text.input, which differ when in edit mode)
    // 16. inputsToDisplayDimensionOfStableWidthText: if displayDimensionOfStableText is true, this is the os of values which will be taken into consideration 
    //      in calculating the width of the TextInput area while being edited. See DateInput for a case where the default value (displayText) is overridden.
    // 17. textForAppData: param.input.value, by default. see ValSelectorDisplay for variation on this (where empty string is interpreted as reverting to +/-Infinity)
    // 18. notAllowedInputValues: inheriting class may define os of values which are not allowed as input text
    // 19. enableBoxShadow: boolean. true, by default
    // 20. initEditInputTextSelectionStart / initEditInputTextSelectionEnd: the index of the range of selection on the initial text in the edited TextInput.
    //     default values are 0/-1 respectively, i.e. the entire initial string is selected.
    // 21. defaultTextInputDesign: boolean. false, by default
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TextInput: o(
        { // variant-controller
            qualifier: "!",
            context: {
                mouseEventToEdit: "Click",
                mouseToEdit: true,
                rememberTextWasEdited: false,
                "^textWasEdited": false,
                "*editInputText": [{ initEditInputText: _ }, [me]],
                recordTextOnMouseDownOutsideMe: true,
                displayDimensionOfStableText: false,
                allowToExitEditInputTextMode: true,
                allowDuplicateValues: false,
                allowWritingInput: [{ defaultAllowWritingInput: _ }, [me]],
                errorMsgOnDisplay: [
                    { inputArea: [me] },
                    [areaOfClass, "InputErrorMsg"]
                ],
                enableBoxShadow: true,
                defaultTextInputDesign: false
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                keyboardEventsToExitEditInputText: noCtrlEnterEvent,
                initEditInputText: [cond,
                    [{ rememberTextWasEdited: _ }, [me]],
                    o(
                        { on: true, use: [not, [{ textWasEdited: _ }, [me]]] },
                        { on: false, use: false }
                    )
                ],
                textForAppData: [{ param: { input: { value: _ } } }, [me]],
                placeholderInputText: "<Input text>",

                "*inputAD": o(),
                inputAppData: [mergeWrite,
                    [{ inputAD: _ }, [me]],
                    [cond, // default value for mergeWrite
                        [{ initInputAppData: _ }, [me]],
                        o(
                            { on: true, use: [{ initInputAppData: _ }, [me]] },
                            { on: false, use: [{ placeholderInputText: _ }, [me]] }
                        )
                    ]
                ],
                displayText: [{ inputAppData: _ }, [me]],
                inputTextAlreadyBeingUsed: [
                    [{ param: { input: { value: _ } } }, [me]],
                    [{ inputTextValuesAlreadyUsed: _ }, [me]]
                ],
                editedInputTextAlreadyBeingUsed: [and,
                    [{ editInputText: _ }, [me]],
                    [{ inputTextAlreadyBeingUsed: _ }, [me]]
                ],
                inputTextNotAllowed: [and,
                    [{ editInputText: _ }, [me]],
                    [
                        [{ notAllowedInputValues: _ }, [me]],
                        [{ param: { input: { value: _ } } }, [me]]
                    ]
                ],
                inputAppDataIsPlaceholderText: [equal,
                    [{ inputAppData: _ }, [me]],
                    [{ placeholderInputText: _ }, [me]]
                ],
                inputIsEmpty: [not, [{ param: { input: { value: _ } } }, [me]]],
                inputIsPlaceholderInputText: [equal,
                    [{ param: { input: { value: _ } } }, [me]],
                    [{ placeholderInputText: _ }, [me]]
                ],
                defaultAllowWritingInput: [and,
                    [not, [{ inputIsEmpty: _ }, [me]]],
                    [not, [{ inputIsPlaceholderInputText: _ }, [me]]],
                    [cond,
                        [{ allowDuplicateValues: _ }, [me]],
                        o(
                            { on: true, use: true },
                            { on: false, use: [not, [{ editedInputTextAlreadyBeingUsed: _ }, [me]]] }
                        )
                    ],
                    [not, [{ inputTextNotAllowed: _ }, [me]]]
                ]
            }
        },
        {
            qualifier: { defaultTextInputDesign: true },
            "class": "TextInputDesign"
        },
        {
            qualifier: { mouseToEdit: true },
            "class": "BlockMouseEvent"
        },
        {

            qualifier: {
                mouseToEdit: true,
                editInputText: false
            },
            write: {
                onTextInputEditMouseEvent: {
                    upon: [cond,
                        [{ mouseEventToEdit: _ }, [me]],
                        o(
                            { on: "Click", use: mouseClickEvent },
                            { on: "DoubleClick", use: mouseDoubleClickEvent },
                            { on: "DoubleClickExpired", use: mouseDoubleClickExpiredEvent },
                            { on: "ClickExpired", use: mouseClickExpiredEvent }
                        )
                    ],
                    true: { // upon in qualifier below
                        editInputTextOn: {
                            to: [{ editInputText: _ }, [me]],
                            merge: true
                        },
                        turnOffAnyOtherEditInputText: {
                            to: [
                                { editInputText: _ },
                                [{ editInputText: true }, [areaOfClass, "TextInput"]]
                            ],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { editInputText: true },
            "class": "AboveAppZTop", // for the html text input element to work properly, it needs to be z-highest.
            context: {
                initEditInputTextSelectionStart: 0,
                initEditInputTextSelectionEnd: -1
            },
            display: {
                text: {
                    // value: defined by DefaultDisplayText
                    input: {
                        type: "text",
                        placeholder: [{ placeholderInputText: _ }, [me]],
                        init: {
                            selectionStart: [{ initEditInputTextSelectionStart: _ }, [me]],
                            selectionEnd: [{ initEditInputTextSelectionEnd: _ }, [me]],
                            selectionDirection: "forward",
                            focus: true
                        }
                    }
                }
            },
            write: {
                onTextInputEsc: {
                    "class": "OnEsc",
                    true: {
                        editInputTextOff: {
                            to: [{ editInputText: _ }, [me]],
                            merge: false
                        }
                    }
                },
                onTextInputExitEditInputTextMode: {
                    upon: [and,
                        [{ allowToExitEditInputTextMode: _ }, [me]],
                        [{ editInputText: _ }, [me]],
                        o(
                            [and,
                                [{ recordTextOnMouseDownOutsideMe: _ }, [me]],
                                [mouseDownNotHandledBy,
                                    o([me], [{ immuneFromTurningOffEditInputOnMouseDown: _ }, [me]])
                                ]
                            ],
                            [{ keyboardEventsToExitEditInputText: _ }, [me]]
                        )
                    ],
                    true: {
                        editInputTextOff: {
                            to: [{ editInputText: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        },
        {
            qualifier: { allowWritingInput: true },
            write: {
                onTextInputExitEditInputTextMode: {
                    // upon: see default clause
                    true: {
                        storeNewTextValue: {
                            to: [{ inputAppData: _ }, [me]],
                            merge: [{ textForAppData: _ }, [me]]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                editInputText: true,
                displayDimensionOfStableText: true
            },
            "class": "CalculateMaxWidthOfStrings",
            context: {
                inputsToDisplayDimensionOfStableWidthText: [{ displayText: _ }, [me]],
                displayObjForDimensions: { // this object is merged (at a higher priority) with the area's display object, via [displayHeight]/[displayWidth]
                    // the input:o() is to ensure that the calculated dimension remains fixed, as if we're not in edit mode
                    display: {
                        text: {
                            value: [{ displayText: _ }, [me]],
                            input: o()
                        }
                    }
                }
            },
            position: {
                "content-height": [displayHeight, [{ displayObjForDimensions: _ }, [me]]],
                "content-width": [
                    [{ maxWidthOfStrings: _ }, [me]],
                    [{ inputsToDisplayDimensionOfStableWidthText: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { editedInputTextAlreadyBeingUsed: true },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: "Error: Input not allowed (duplicate value)"
            }
        },
        {
            qualifier: { inputTextNotAllowed: true },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: "Error: Input not allowed"
            }
        },
        {
            qualifier: {
                rememberTextWasEdited: true,
                textWasEdited: false
            }, // the very first time textWasEdited is false
            write: {
                // Example of use:
                // we want the OverlayName to come up with editInputText: true when it is created, but after that, when the session is reloaded,
                // it should not re-initialize itself to true. so after the very first time editInputText becomes true, we set textWasEdited to true.
                // since textWasEdited is part of the overlayData in FSApp, which is actually persisted data, this scheme should work.
                onTextInputEditInputTextOff: {
                    upon: [not, [{ editInputText: _ }, [me]]],
                    true: {
                        textWasEdited: {
                            to: [{ textWasEdited: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Worth noting: the regexps here include some sequences repeated (e.g. [KMBT]). ideally, these regexps would have been constructed by some cdl
    // function, but that is not possible at the moment, as concatStr, naturally turns it into a string, which has a very particular meaning as a regexp...
    //
    // API:
    // 1. allowWritingInput: default definition provided.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    NumberInput: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inputHasFinancialSuffix: [ // is the last character one of [KMBT]
                    s(/[KMBTkmbt]/),
                    [{ inputSuffix: _ }, [me]]
                ],
                inputNotPrefixOfANumber: [and,
                    [{ editInputText: _ }, [me]],
                    [not, [{ inputIsEmpty: _ }, [me]]],
                    [not,
                        [
                            s(/^[+-]?\d*(\.\d*)?[KMBTkmbt]?$/), // [KMBT] allows for a NumericSuffixBase
                            [{ param: { input: { value: _ } } }, [me]]
                        ]
                    ]
                ]
            }
        },
        { // default
            "class": "TextInput",
            context: {
                allowDuplicateValues: true,
                placeholderInputText: "<Num>",
                inputSuffix: [subStr, r(-1, -1), [{ param: { input: { value: _ } } }, [me]]],
                inputIsValidNumber: [
                    s(/^[+-]?((\d+(\.\d*)?)|(\.\d+))[KMBTkmbt]?$/),// [KMBT] allows for a NumericSuffixBase
                    [{ param: { input: { value: _ } } }, [me]]
                ],
                allowWritingInput: [and,
                    [{ inputIsValidNumber: _ }, [me]],
                    [{ defaultAllowWritingInput: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { inputNotPrefixOfANumber: true },
            "class": "CreateInputErrorMsg",
            context: {
                inputErrorMsg: "Error: Input not a valid number"
            }
        },
        {
            qualifier: { inputIsValidNumber: true },
            context: {
                inputAsNumber: [stringToNumber, [{ param: { input: { value: _ } } }, [me]]], // possibly overridden by more specific {inputHasFinancialSuffix: true} below
                textForAppData: [{ inputAsNumber: _ }, [me]]
            }
        },
        {
            qualifier: {
                inputIsValidNumber: true,
                inputHasFinancialSuffix: true
            },
            context: {
                suffixMultiplier: [
                    {
                        suffix: [{ inputSuffix: _ }, [me]],
                        value: _
                    },
                    financialSuffixTable
                ],
                // chop off the suffixBase character, and multiply by the suffixMultiplier to get a valid number w/o a suffix.
                inputAsNumber: [mul,
                    [stringToNumber, [subStr, r(0, -2), [{ param: { input: { value: _ } } }, [me]]]], // input w/o financialSuffix
                    [{ suffixMultiplier: _ }, [me]]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For now, no enforcement of any structure.
    // API:
    // 1. dateInputFormat: default provided
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DateInput: o(
        { // variant-controller
            qualifier: "!",
            context: {
                dateInputFormat: [{ myApp: { defaultAbridgedDateFormat: _ } }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "TextInput"),
            context: {
                /*maxDateAllowed: [dateToNum,
                    "01/01/2100",
                    "dd/MM/yyyy"
                ],
                inputIsAValidDate: [ // override TextInput def. see SliderScaleEditableLabelText for a refined definition used for Slider vals.
                    [{ dateInputValueAsNumber: _ }, [me]],
                    r(0, [{ maxDateAllowed:_ }, [me]])
                ],*/
                inputIsAValidDate: [
                    // a regular expression for dd-mm-yyyy
                    s(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/),
                    /* a regular expression for mm-dd-yyyy
                    /^(?:(?:(?:0?[13578]|1[02])(\/|-|\.)31)\1|(?:(?:0?[1,3-9]|1[0-2])(\/|-|\.)(?:29|30)\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:0?2(\/|-|\.)29\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:(?:0?[1-9])|(?:1[0-2]))(\/|-|\.)(?:0?[1-9]|1\d|2[0-8])\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
                    */
                    [{ param: { input: { value: _ } } }, [me]]
                ],
                allowWritingInput: [{ inputIsAValidDate:_ }, [me]],

                // this should be modified once we start checking for correctness of date input.
                displayDimensionOfStableText: true, // override TextInput definition
                placeholderInputText: [concatStr,
                    o(
                        "<",
                        [{ dateInputFormat: _ }, [me]],
                        ">"
                    )
                ],
                // we override TextInput's value, so that the DateInput area, when edited, is wide enough to show the entire placeholdeInputText.
                inputsToDisplayDimensionOfStableWidthText: o(
                    [{ displayText: _ }, [me]],
                    [{ placeholderInputText: _ }, [me]]
                )
            }
        },
        {
            qualifier: { editInputText: true },
            context: {
                dateInputValueAsNumber: [dateToNum, // override TextInput definition: the param.input.value needs to be converted from a date to a number!
                    [{ param: { input: { value: _ } } }, [me]],
                    [{ dateInputFormat: _ }, [me]]
                ],
                textForAppData: [cond,
                    [{ inputIsEmpty: _ }, [me]],
                    o(
                        {
                            on: false, // i.e. it's a date, and should be used as such
                            use: [{ dateInputValueAsNumber: _ }, [me]]
                        },
                        {
                            on: true, // i.e. reset the associated user* appData by writing o() to it.
                            use: o()
                        }
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: inputErrorMsg
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    CreateInputErrorMsg: {
        context: {
            inputErrorMsg: "Error: Invalid input"
        },
        children: {
            error: {
                "class": "PartnerWithIconEmbedding",
                description: {
                    "class": "InputErrorMsg"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText: default provided. 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    InputErrorMsg: {
        "class": o("InputErrorMsgDesign", "GeneralArea", "DisplayDimension", "IconAboveAppZTop"),
        context: {
            inputArea: [expressionOf],
            displayText: [{ inputArea: { inputErrorMsg: _ } }, [me]]
        },
        position: {
            attachToInputAreaHorizontally: {
                point1: {
                    element: [{ inputArea: _ }, [me]],
                    type: "left"
                },
                point2: {
                    type: "left"
                },
                equals: generalPosConst.inputErrorHorizontalOffset
            },
            attachToInputAreaVertically: {
                point1: {
                    element: [{ inputArea: _ }, [me]],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: generalPosConst.inputErrorVerticalOffset
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    //* Inheriting class can also inherit the "SearchBoxDesign" class
    // 1. searchStr - AD - should be [{ myApp: { allSearchBoxesFields: { X:_ } } }, [me]] in order to be reset automatically
    // 2. dimensions - in the form of context labels:
    //                  searchBoxWidth, searchBoxHeight        
    // 3. positioning
    // 4. placeholderInputText
    // 5. realtimeSearch: boolean flag indicating whether search is performed on text as it is typed, or only on Enter/searchControl click.
    // 6. searchBoxTextSize: default provided (see Design class)
    // 7. searchBoxDefaultTextColor: default provided (see Design class)
    // 8. enableMinimization: boolean flag indicating whether the search can be minimized (default:false) *no default design class
    // 9. initExpandedSearchBox: a boolean flag that control the initial expansion state of the search box (default:true - expended)
    // 10. initEditInputText: boolean, default value provided.
    // 11. showSearchControl: boolean, default value provided.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SearchBox: o(
        { // variant-controller 
            qualifier: "!",
            context: {
                "*expandedSearchBox": [{ initExpandedSearchBox: _ }, [me]],
                enableMinimization: false,
                realtimeSearch: false,
                showSearchControl: true,
                currentSearchStr: [cond,
                    [{ realtimeSearch: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [cond,
                                [{ searchBoxEdited: _ }, [me]],
                                o(
                                    { on: true, use: [{ searchStrToBeStored: _ }, [me]] },
                                    { on: false, use: [{ searchStr: _ }, [me]] }
                                )
                            ]
                        },
                        {
                            on: false,
                            use: [{ searchStr: _ }, [me]]
                        }
                    )
                ],
                searchDefined: o(
                    [{ searchStr: _ }, [me]],
                    [{ searchStrToBeStored: _ }, [me]]
                )
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                //"^searchStr": o(), // param, see searchStr allSearchBoxesFields in FSApp context
                initExpandedSearchBox: true,
                mySearchBoxInput: [{ children: { searchBoxInput: _ } }, [me]],
                searchBoxEdited: [{ mySearchBoxInput: { editInputText: _ } }, [me]],
                searchStrToBeStored: [cond,
                    [{ mySearchBoxInput: { inputIsPlaceholderInputText: _ } }, [me]],
                    o(
                        { on: true, use: o() }, // i.e. as there was no search term entered explicitly by the user
                        { on: false, use: [{ mySearchBoxInput: { textForAppData: _ } }, [me]] }
                    )
                ],
                initEditInputText: false,
                "*editInputText": [{ initEditInputText: _ }, [me]],
                searchBoxMargin: [densityChoice, [{ fsAppPosConst: { margin: _ } }, [globalDefaults]]]
            },
            position: {
                height: [{ searchBoxHeight: _ }, [me]]
            }
        },
        {
            qualifier: { expandedSearchBox: true },
            children: {
                searchBoxInput: {
                    description: {
                        "class": "SearchBoxInput"
                    }
                }
            },
            position: {
                width: [{ searchBoxWidth: _ }, [me]]
            }
        },
        {
            qualifier: {
                expandedSearchBox: true,
                showSearchControl: true
            },
            children: {
                searchControl: {
                    description: {
                        "class": "SearchControl"
                    }
                }
            },
            position: {
                attachInputToSearchControl: {
                    point1: {
                        element: [{ children: { searchBoxInput: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        element: [{ children: { searchControl: _ } }, [me]],
                        type: "left"
                    },
                    equals: [{ searchBoxMargin: _ }, [me]]
                }
            }
        },
        {
            qualifier: {
                expandedSearchBox: true,
                showSearchControl: false
            },
            position: {
                attachSearchInputToMyRight: {
                    point1: {
                        element: [{ children: { searchBoxInput: _ } }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "right"
                    },
                    equals: 0
                }
            }
        },
        {

            qualifier: { expandedSearchBox: true, enableMinimization: true },
            children: {
                searchBoxMinimizationButton: {
                    description: {
                        "class": "SearchBoxMinimizationButton"
                    }
                }
            }
        },
        {
            qualifier: { expandedSearchBox: false, enableMinimization: true },
            "class": "TooltipableControl",
            context: {
                tooltipText: [cond,
                    [{ searchStr: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ searchStr: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [concatStr,
                                o(
                                    [{ myApp: { expandStr: _ } }, [me]],
                                    [{ myApp: { searchBoxStr: _ } }, [me]]
                                ),
                                " "
                            ]
                        }
                    )
                ]
            },
            position: {
                width: [densityChoice, [{ fsAppPosConst: { widthOfMinimizedSearchBox: _ } }, [globalDefaults]]],
            },
            write: {
                onSearchBoxExpand: {
                    "class": "OnMouseClick",
                    true: {
                        expandSearchBox: {
                            to: [{ expandedSearchBox: _ }, [me]],
                            merge: true
                        },
                        setTextInputInFocus: {
                            to: [{ editInputText: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. mySearchBox: default provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMySearchBox: o(
        { // variant-controller
            qualifier: "!",
            context: {
                realtimeSearch: [{ mySearchBox: { realtimeSearch: _ } }, [me]],
                searchDefined: [{ mySearchBox: { searchDefined: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                mySearchBox: [
                    [embeddingStar, [me]],
                    [areaOfClass, "SearchBox"]
                ]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SearchBoxMinimizationButton: {
        "class": o("SearchBoxMinimizationButtonDesign", "GeneralArea"),
        position: {
            top: 0,
            bottom: 0,
            width: [densityChoice, [{ fsAppPosConst: { widthOfSearchBoxMinimizationButton: _ } }, [globalDefaults]]],
            left: 0,
        },
        write: {
            onSearchBoxMinimizationButtonMinimaize: {
                "class": "OnMouseClick",
                true: {
                    minimizeSearchBox: {
                        to: [{ expandedSearchBox: _ }, [embedding]],
                        merge: false
                    }
                }
            }
        },
        children: {
            searchBoxMinimizationButtonTriangle: {
                description: {
                    "class": "SearchBoxMinimizationButtonTriangle",
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    SearchBoxMinimizationButtonTriangle: {
        "class": o("GeneralArea", "RightSideTriangle"),
        context: {
            triangleColor: "white"
        },
        propagatePointerInArea: "embedding", // required becuase of background color 
        position: {
            height: [densityChoice, [{ fsAppPosConst: { heightOfSearchBoxMinimizationButtonTriangle: _ } }, [globalDefaults]]],
            width: [densityChoice, [{ fsAppPosConst: { widthOfSearchBoxMinimizationButtonTriangle: _ } }, [globalDefaults]]],
            "vertical-center": 0,

        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    SearchBoxInput: o(
        { // default
            "class": o("SearchBoxInputDesign", "TextInput", "TrackMySearchBox"),
            context: {
                "*searchStr": o(), // if not in realtime search, the SearchBoxInput stores as NPAD the text entered, and writes it to the SearchBox's AD on enter

                // TextInput params
                placeholderInputText: [{ mySearchBox: { placeholderInputText: _ } }, [me]],
                allowWritingInput: [not, [{ inputIsPlaceholderInputText: _ }, [me]]], // override TextInput default definition
                displayText: [cond,
                    [{ searchDefined: _ }, [me]],
                    o(
                        { on: true, use: [{ inputAppData: _ }, [me]] },
                        { on: false, use: [{ placeholderInputText: _ }, [me]] }
                    )
                ],
                defaultEditInputDisplay: false,
                editInputText: [{ mySearchBox: { editInputText: _ } }, [me]] // override default def
            },
            position: {
                minToSearchBoxBorder: {
                    point1: {
                        type: "left",
                        element: [embedding]
                    },
                    point2: {
                        type: "left",
                    },
                    min: 0
                },
                minToToggleButton: {
                    point1: {
                        type: "right",
                        element: [{ children: { searchBoxMinimizationButton: _ } }, [embedding]] // context label
                    },
                    point2: {
                        type: "left"
                    },
                    min: 0
                },
                attachToSearchBoxBorder: {
                    point1: {
                        type: "left",
                        element: [embedding]
                    },
                    point2: {
                        type: "left",
                    },
                    orGroups: { label: "searchBoxInputAnchorInSearchBox" },
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    equals: 0
                },
                attachToToggleButton: {
                    point1: {
                        type: "right",
                        element: [{ children: { searchBoxMinimizationButton: _ } }, [embedding]]
                    },
                    point2: {
                        type: "left"
                    },
                    orGroups: { label: "searchBoxInputAnchorInSearchBox" },
                    priority: positioningPrioritiesConstants.weakerThanDefault,
                    equals: 0
                },
                //    left: [{ searchBoxMargin: _ }, [embedding]],
                top: 0,
                bottom: 0
            }
        },
        {
            qualifier: { realtimeSearch: true },
            context: {
                // TextInput params
                inputAppData: [{ mySearchBox: { searchStr: _ } }, [me]]
            }
        },
        {
            qualifier: { realtimeSearch: false },
            context: {
                // TextInput params
                inputAppData: [{ searchStr: _ }, [me]]
            }
        }
    ),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    SearchControl: o(
        { // default
            "class": o("SearchControlDesign", "BlockMouseEvent", "TrackMySearchBox"),
            position: {
                right: [{ searchBoxMargin: _ }, [embedding]],
                top: 0,
                bottom: 0,
                widthAsAFunctionOfHeight: {
                    pair1: {
                        point1: { type: "left" },
                        point2: { type: "right" }
                    },
                    pair2: {
                        point1: { type: "top" },
                        point2: { type: "bottom" }
                    },
                    ratio: 1.15 // the searchControl icon should be this ration value wider than it is taller
                }
            }
        },
        {
            qualifier: { realtimeSearch: false },
            write: {
                // the mouseDown here, like any other mouseDown, will switch the SearchBoxInput out of edit mode (if it was in edit mode, that is)
                // so that by the arrival of the mouseClick, 
                onSearchControlMouseClick: { // or Enter, when 
                    upon: o(
                        mouseClickEvent,
                        [and,
                            enterEvent,
                            [{ mySearchBox: { searchBoxEdited: _ } }, [me]]
                        ]
                    ),
                    true: {
                        storeSearchStr: {
                            to: [{ mySearchBox: { searchStr: _ } }, [me]],
                            merge: [{ mySearchBox: { searchStrToBeStored: _ } }, [me]]
                        }
                    }
                }
            }
        }
    ),

    /*
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. positioning/dimensions
    // 2. mySearchBox: default provided
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ClearSearchControl: {
        "class": o("ClearSearchControlDesign", "GeneralArea"),
        context: {
            mySearchBox: [embedding]            
        },
        write: {
            onClearSearchControlMouseDown: {
                "class": "OnMouseDown",
                true: {
                    clearSearchStr: {
                        to: [cond,
                             [{ mySearchBox: { searchBoxEdited:_ } }, [me]],
                             o(
                               // this line below triggers an exception (emailed theo about this on 13/3/2016)
                               // { on: true, use: [{ mySearchBox: { mySearchBoxInput: { param: { input: { value:_ } } } } }, [me]] },
                               { on: false, use: [{ mySearchBox: { searchStr:_ } }, [me]] }
                              )
                            ],
                        merge: o()
                    }
                }
            }
        }
    },*/

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PostIt: {
        "class": o("PostItDesign", "GeneralArea", "AboveSiblings", "DraggableWeakMouseAttachment", "ExpandableBottomRight", "BlockMouseEvent", "ConfinedToArea"),
        context: {
            draggableStable: true,
            initialExpandableHeight: 100,
            initialExpandableWidth: 600,

            horizontalMarginFromEmbedded: 0,

            confinedToArea: [embedding]
        },
        children: {
            title: {
                description: {
                    "class": "PostItTitle"
                }
            },
            body: {
                description: {
                    "class": "PostItBody"
                }
            },
            closeControl: {
                description: {
                    "class": "PostItClose"
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PostItTitle: {
        "class": o("PostItTitleDesign", "GeneralArea", "TextInput"),
        context: {
            placeholderInputText: "<Title>"
        },
        position: {
            top: 0,
            height: 30,
            left: [{ horizontalMarginFromEmbedded: _ }, [embedding]],
            right: [{ horizontalMarginFromEmbedded: _ }, [embedding]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PostItBody: {
        "class": o("PostItBodyDesign", "GeneralArea", "TextInput"),
        context: {
            placeholderInputText: "<Text>"
        },
        position: {
            attachToTitle: {
                point1: {
                    element: [{ children: { title: _ } }, [embedding]],
                    type: "bottom"
                },
                point2: { type: "top" },
                equals: 0
            },
            bottom: 0,
            left: [{ horizontalMarginFromEmbedded: _ }, [embedding]],
            right: [{ horizontalMarginFromEmbedded: _ }, [embedding]]
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    PostItClose: {
        "class": o("PostItCloseDesign", "GeneralArea"),
        position: {
            right: 0,
            top: 0,
            width: 20,
            height: 20
        },
        write: {
            onPostItCloseClick: {
                "class": "OnMouseClick",
                true: {
                    closePostIt: {
                        to: [{ myApp: { showPostIt: _ } }, [me]],
                        merge: false
                    }
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////
    // Beginning of ScaleModeControl Classses
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // API:
    // 1. orderOfScaleModes
    // 2. scaleMode
    // 3. nextScaleMode
    // 4. edgeScaleMode
    // 5. roundRobin. true, by default
    // 6. ofVerticalElement
    // 7. dimensions
    ///////////////////////////////////////////////////////////////////////
    ScaleModeControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                roundRobin: true,
                scaleAtEdgeScaleMode: [
                    equal,
                    [{ scaleMode: _ }, [me]],
                    [{ edgeScaleMode: _ }, [me]]
                ],
                activeControl: o(
                    [{ roundRobin: _ }, [me]],
                    [
                        and,
                        [not, [{ roundRobin: _ }, [me]]],
                        [
                            notEqual,
                            [{ scaleMode: _ }, [me]],
                            [{ scaleAtEdgeScaleMode: _ }, [me]]
                        ]
                    ]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "BlockMouseEvent", "ModifyPointerClickable")
        },
        {
            qualifier: { activeControl: true },

            write: {
                onScaleModeControlMouseClick: {
                    "class": "OnMouseClick",
                    true: {
                        switchToNextScaleMode: {
                            to: [{ scaleMode: _ }, [me]],
                            merge: [{ nextScaleMode: _ }, [me]]
                        }
                    }
                }
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    PrevScaleModeControl: o(
        { // default
            "class": o("PrevScaleModeControlDesign", "ScaleModeControl"),
            context: {
                // ScaleModeControl params:
                nextScaleMode: [
                    prev,
                    [{ orderOfScaleModes: _ }, [me]],
                    [{ scaleMode: _ }, [me]]
                ],
                edgeScaleMode: [
                    first,
                    [{ orderOfScaleModes: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                roundRobin: true, scaleAtEdgeScaleMode: true
            },
            context: {
                nextScaleMode: [
                    last,
                    [{ orderOfScaleModes: _ }, [me]]
                ]
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    NextScaleModeControl: o(
        { // default
            "class": o("NextScaleModeControlDesign", "ScaleModeControl"),
            context: {
                // ScaleModeControl params:
                nextScaleMode: [
                    next,
                    [{ orderOfScaleModes: _ }, [me]],
                    [{ scaleMode: _ }, [me]]
                ],
                edgeScaleMode: [
                    last,
                    [{ orderOfScaleModes: _ }, [me]]
                ]
            }
        },
        {
            qualifier: {
                roundRobin: true, scaleAtEdgeScaleMode: true
            },
            context: {
                nextScaleMode: [
                    first,
                    [{ orderOfScaleModes: _ }, [me]]
                ]
            }
        }
    ),

    ///////////////////////////////////////////////////////////////////////
    // End of ScaleModeControl Classses
    ///////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines
    // 1. inArea: when the pointer is inside the area, false otherwise.
    // 2. inFocus: equals inArea when the app is not in the midst of an operation, and otherwise equals the area's own myOperationInProgress.
    //
    // API:
    // 1. myApp
    // 2. Inheriting classes may also inherit Operationable, and define its myOperationInProgress boolean flag.
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    InArea: o(
        { // variant-controller
            qualifier: "!",
            context: {
                inArea: [{ param: { pointerInArea: _ } }, [me]],
                inFocus: [cond,
                    [{ myApp: { operationInProgress: _ } }, [me]],
                    o(
                        { on: false, use: [{ inArea: _ }, [me]] },
                        { on: true, use: [{ myOperationInProgress: _ }, [me]] }
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class defines
    // 1. delayedInArea: a boolean set to true after inAreaDelay seconds from the moment inArea became true.
    // 2. delayedInFocus: equals delayedInFocus when the app is not in the midst of an operation, and otherwise equals the area's own myOperationInProgress.
    //
    // API:
    // 1. myApp
    // 2. Inheriting classes may also inherit Operationable, and define its myOperationInProgress boolean flag.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DelayedInArea: o(
        { // variant-controller
            qualifier: "!",
            context: {
                delayedInArea: [and,
                    [{ inArea: _ }, [me]],
                    [greaterThan,
                        [time,
                            [{ inArea: _ }, [me]],
                            [{ inAreaDelay: _ }, [me]]
                        ],
                        0
                    ]
                ],
                delayedInFocus: [cond,
                    [{ myApp: { operationInProgress: _ } }, [me]],
                    o(
                        { on: false, use: [{ delayedInArea: _ }, [me]] },
                        { on: true, use: [{ myOperationInProgress: _ }, [me]] }
                    )
                ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                inAreaDelay: [{ myApp: { defaultInAreaDelay: _ } }, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is a first attempt at handling all pointer-related logic in a single area.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    PointerArea: {
        context: {
            // if there's an area inheriting DraggableIcon, use its pointerImage.
            // otherwise, select from the areasUnderPointer those which have a claim to modify the pointer.
            // take the pointerImage of the first of those (i.e. the highest-z one)
            modifiedPointer: [
                { pointerImage: _ },
                [first,
                    [cond,
                        o(
                            [areaOfClass, "DraggableIcon"],
                            [{ tmd: true }, [areaOfClass, "ModifyPointerDragging"]]
                        ),
                        o(
                            {
                                on: true,
                                use: [areaOfClass, "ModifyPointerDragging"] // same pointerImage as DraggableIcon!
                            },
                            {
                                on: false,
                                use: [
                                    [
                                        o(
                                            { delayPointerModification: false, inFocus: true },
                                            { delayPointerModification: true, delayedInFocus: true }
                                        ),
                                        [areaOfClass, "ModifyPointer"]
                                    ],
                                    [areasUnderPointer]
                                ]
                            }
                        )
                    ]
                ]
            ],
            pointerImage: [cond,
                [{ modifiedPointer: _ }, [me]],
                o(
                    { on: true, use: [{ modifiedPointer: _ }, [me]] },
                    { on: false, use: "default" }
                )
            ]
        },
        write: {
            onPointerAreaPointerImageChange: {
                upon: [changed, [{ pointerImage: _ }, [me]]],
                true: {
                    modifyPointer: {
                        to: [{ display: { image: _ } }, [pointer]],
                        merge: [{ pointerImage: _ }, [me]]
                    }
                }
            },
            onPointerAreaPointerExitBrowser: {
                upon: [not, [{ myApp: { pointerWithinBrowser: _ } }, [me]]],
                true: {
                    modifyPointer: {
                        to: [{ display: { image: _ } }, [pointer]],
                        merge: "default"
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // delayPointerModification: false, by default. If true, DelayedInArea is inherited, and its API is available.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointer: o(
        { // variant-controller
            qualifier: "!",
            context: {
                delayPointerModification: false
            }
        },
        {
            "class": "GeneralArea"
        },
        {
            qualifier: { delayPointerModification: true },
            "class": "DelayedInArea"
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerClickable: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "pointer"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerDraggable: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "grab"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerDragging: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "grabbing"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerHorizontalResize: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "ew-resize"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerVerticalResize: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "ns-resize"
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ModifyPointerHorizontalSEResize: {
        "class": "ModifyPointer",
        context: {
            pointerImage: "se-resize" // south-east resize
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API: 
    // 1. clipper
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Clipper: {
        "class": "GeneralArea",
        position: {
            clipperLeftAnchor: {
                point1: {
                    type: "left"
                },
                point2: {
                    element: [{ clipper: _ }, [me]],
                    type: "left",
                    content: true
                },
                equals: 0
            },
            clipperRightAnchor: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [{ clipper: _ }, [me]],
                    type: "right",
                    content: true
                },
                equals: 0
            },
            clipperTopAnchor: {
                point1: {
                    type: "top"
                },
                point2: {
                    element: [{ clipper: _ }, [me]],
                    type: "top",
                    content: true
                },
                equals: 0
            },
            clipperBottomAnchor: {
                point1: {
                    type: "bottom"
                },
                point2: {
                    element: [{ clipper: _ }, [me]],
                    type: "bottom",
                    content: true
                },
                equals: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is a class inherited by the vast majority of classes. Gives them access to the app's areaRef.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    GeneralArea: o(
        { // variant-controller
            qualifier: "!",
            context: {
                displayDensityValue: [{ myApp: { displayDensity: _ } }, [me]]
            }
        },
        { // default
            "class": o("InArea", "TrackABTesting"),
            context: {
                myApp: [areaOfClass, "App"], // assuming there is only one instance of App!
                myClasses: [classOfArea, [me]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Beginning of Debug Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DebugBreak: {
        db: {
            to: [debugBreak],
            merge: true
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Debug Classes
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
};
