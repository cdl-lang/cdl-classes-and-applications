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

// %%classfile%%: <tagDesignClasses.js>

initGlobalDefaults.tagConstants = {
    initNumFacetColumnsWhenTagsViewShowing: 2,
    tagHeight: { "V1": 13, "V2": 15, "V3": 21 },

    tagSelectionControlDimension: { "V1": 13, "V2": 15, "V3": 21 },
    tagSelectionControlIconDimension: { "V1": 9, "V2": 11, "V3": 17 },
    tagSelectionControlExternalMargin: { "V1": 2, "V2": 3, "V3": 4 },
    deleteTagControlRightMargin: { "V1": 2, "V2": 2, "V3": 2 },

    horizontalSpacingBetweenTagRows: { "V1": 6, "V2": 8, "V3": 10 },
    verticalSpacingBetweenTagRows: { "V1": 4, "V2": 5, "V3": 7 },
    addSelectableTagTextInputWidth: { "V1": 70, "V2": 90, "V3": 100 },

    maxTagWidth: { "V1": 90, "V2": 105, "V3": 130 },
    selectionHotspotWidthOnSelectableTag: { "V1": 5, "V2": 10, "V3": 15 },

    horizontalOffsetToAddTagDropdownMenu: 3,

    tagsViewControlIconToLabelSpacing: 2,

    numRowsInEntityTagsView: 3
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////  
    // Note: tags should be refined so that the value stored is a uniqueID, and not the string displayed (to allow porting to different languages)
    //
    // API:
    // 1. tagsData: an os of objects which include the 'tags' attribute. used for counting the instances of a tag before it is globally deleted.
    // 1. appTags 
    // 2. preloadedTags
    // 3. defaultSelectedTags. 
    // 4. showTagsViewPaneAD: AD, set to defaultShowTagsViewPaneControl (not defined, and so false, by default)
    // 5. userDefinedTagsObj: AD of an object. Inheriting class can map to its own writable object (see FacetTagsController, for example)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    TagsController: {
        "class": "GeneralArea",
        context: {
            "^showTagsViewPaneAD": o(),
            showTagsViewPane: [mergeWrite,
                [{ showTagsViewPaneAD: _ }, [me]],
                [{ defaultShowTagsViewPaneControl: _ }, [me]]
            ],
            "^userDefinedTagsObj": o(),
            // Note: this is a non-standard mergeWrite because userDefinedTags can store o() as a perfectly valid value.
            // if it stores that value, mergeWrite cannot differentiate between a non-existent path for its first parameter (in which case it should
            // take its second parameter), and the "valid" o() value. 
            // to work around that, we merge it with (the second parameter in the mergeWrite) an *object*, and not a terminal
            userDefinedTags: [
                { userDefinedTags: _ },
                [mergeWrite,
                    [{ userDefinedTagsObj: _ }, [me]],
                    { userDefinedTags: [{ preloadedTags: _ }, [me]] }
                ]
            ],
            userAssignedTags: [{ userDefinedTags: _ }, [me]], // for now, these get a visual indicator in the TagsViewPane, and the user can delete them.
            sortedUserAssignedTags: [sort,
                [{ userAssignedTags: _ }, [me]],
                "ascending"
            ],
            tags: o(
                [{ sortedUserAssignedTags: _ }, [me]],
                [{ appTags: _ }, [me]]
            ),

            // we distinguish between the userIncludedTags AD and the includedTags, which is a selection of these out of all tags.
            // this may be needed, for example, when the user selects tags over one dataSource, and then switches to another datasource.
            "^userSelectedTagsAD": o(),
            userIncludedTags: [mergeWrite,
                [{ userSelectedTagsAD: { included: _ } }, [me]],
                [{ defaultSelectedTags: _ }, [me]]
            ],
            includedTags: [
                [{ userIncludedTags: _ }, [me]],
                [{ tags: _ }, [me]]
            ],

            userExcludedTags: [mergeWrite,
                [{ userSelectedTagsAD: { excluded: _ } }, [me]],
                o()
            ],
            excludedTags: [
                [{ userExcludedTags: _ }, [me]],
                [{ tags: _ }, [me]]
            ],

            selectedTags: o(
                [{ includedTags: _ }, [me]],
                [{ excludedTags: _ }, [me]]
            ),

            myShowTagsViewPaneControl: [
                { myTagsController: [me] },
                [areaOfClass, "ShowTagsViewPaneControl"]
            ],

            showTagsViewPaneAction: o(
                [
                    {
                        recipient: [{ myShowTagsViewPaneControl: _ }, [me]],
                        subType: "Click"
                    },
                    [message]
                ]
            ),

            draggedTag: [
                { myTagsController: [me] },
                [areaOfClass, "DraggedTag"]
            ],

            entityTagsViewHeight: [mul,
                [{ tagConstants: { numRowsInEntityTagsView: _ } }, [globalDefaults]],
                [plus,
                    [densityChoice, [{ tagConstants: { tagHeight: _ } }, [globalDefaults]]],
                    [densityChoice, [{ tagConstants: { verticalSpacingBetweenTagRows: _ } }, [globalDefaults]]]
                ]
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    // API:
    // 1. myTagsController: default provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    TrackMyTagsController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showTagsViewPane: [{ myTagsController: { showTagsViewPane: _ } }, [me]],
                tags: [{ myTagsController: { tags: _ } }, [me]],
                userDefinedTags: [{ myTagsController: { userDefinedTags: _ } }, [me]],
                userAssignedTags: [{ myTagsController: { userAssignedTags: _ } }, [me]],
                sortedUserAssignedTags: [{ myTagsController: { sortedUserAssignedTags: _ } }, [me]],

                userIncludedTags: [{ myTagsController: { userIncludedTags: _ } }, [me]],
                userExcludedTags: [{ myTagsController: { userExcludedTags: _ } }, [me]],
                includedTags: [{ myTagsController: { includedTags: _ } }, [me]],
                excludedTags: [{ myTagsController: { excludedTags: _ } }, [me]],
                selectedTags: [{ myTagsController: { selectedTags: _ } }, [me]],
                showTagsViewPaneAction: [{ myTagsController: { showTagsViewPaneAction: _ } }, [me]],

                draggedTag: [{ myTagsController: { draggedTag: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myTagsController: [
                    [embeddingStar, [me]],
                    [areaOfClass, "TagsController"]
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ShowTagsViewPaneControl: {
        "class": o("ShowTagsViewPaneControlDesign", "GeneralArea", "AppControl", "ControlModifiedPointer", "TrackMyTagsController"),
        context: {
            tooltipText: [
                [{ myApp: { booleanStringFunc: _ } }, [me]],
                [{ actionMetaphors: { showTagsViewPane: _ } }, [globalDefaults]],
                "",
                [concatStr, o([{ myApp: { tagEntityStr: _ } }, [me]], " ", [{ myApp: { paneEntityStr: _ } }, [me]])],
                [{ showTagsViewPane: _ }, [me]]
            ]
        },
        write: {
            onShowTagsViewPaneControl: {
                "class": "OnMouseClick",
                true: {
                    toggleShowTagsViewPaneControl: {
                        to: [{ myTagsController: { showTagsViewPane: _ } }, [me]],
                        merge: [not, [{ myTagsController: { showTagsViewPane: _ } }, [me]]]
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewPane: {
        "class": o("GeneralArea", "TrackMyTagsController"),
        children: {
            tagsView: {
                description: {
                    "class": "TagsView"
                }
            },
            tagsViewControls: {
                description: {
                    "class": "TagsViewControls"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsView: {
        "class": o("GeneralArea", "VerticalContMovableController", "TrackMyTagsController"),
        context: {
            myScrollbar: [{ children: { verticalScrollbar: _ } }, [me]],
            horizontalMarginAroundScrollbar: 2,

            // VerticalContMovableController params
            beginningOfDocPoint: atomic({
                element: [{ children: { tagsDoc: _ } }, [me]],
                type: "top"
            }),
            endOfDocPoint: atomic({
                element: [{ children: { tagsDoc: _ } }, [me]],
                type: "bottom"
            })
        },
        position: {
            top: 0,
            left: 0,
            right: 0
            // bottom: defined in TagsViewControls
        },
        children: {
            verticalScrollbar: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [embedding],
                        attachToView: "end",
                        attachToViewOverlap: true,
                        showOnlyWhenInView: false
                    }
                }
            },
            tagsDoc: {
                description: {
                    "class": "TagsDoc"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsDoc: {
        "class": o("GeneralArea", "HorizontalWrapAroundController", "MinWrapVertical", "TrackMyTagsController"),
        context: {
            myScrollbar: [{ myScrollbar: _ }, [embedding]],
            myAddSelectableTagContainer: [
                { myTagsController: [{ myTagsController: _ }, [me]] },
                [areaOfClass, "AddSelectableTagContainer"]
            ],
            wrapArounds: o(
                [{ myAddSelectableTagContainer: _ }, [me]],
                [{ children: { tags: _ } }, [me]]
            ),
            wrapAroundSpacing: [densityChoice, [{ tagConstants: { horizontalSpacingBetweenTagRows: _ } }, [globalDefaults]]],
            wrapAroundSecondaryAxisSpacing: [densityChoice, [{ tagConstants: { verticalSpacingBetweenTagRows: _ } }, [globalDefaults]]],

            minWrapTop: [{ wrapAroundSecondaryAxisSpacing:_ }, [me]]
        },
        position: {
            left: 0,
            right: [plus, scrollbarPosConst.docOffsetAllowingForScrollbar, scrollbarPosConst.scrollbarMarginFromView]
        },
        children: {
            addSelectableTagContainer: {
                description: {
                    "class": "AddSelectableTagContainer"
                }
            },
            tags: {
                data: [{ tags: _ }, [me]],
                description: {
                    "class": "SelectableTag"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewControls: {
        "class": o("GeneralArea", "TrackMyTagsController"),
        context: {
            tagControlHeight: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
            tagControlMargin: [densityChoice, [{ fsAppPosConst: { appControlMargin: _ } }, [globalDefaults]]]
        },
        position: {
            left: 0,
            right: 0,
            attachTopToBottomOfTagsView: {
                point1: {
                    element: [areaOfClass, "TagsView"],
                    type: "bottom"
                },
                point2: {
                    type: "top"
                },
                equals: 0
            },
            height: [plus,
                [mul, 2, [{ tagControlMargin: _ }, [me]]],
                [{ tagControlHeight: _ }, [me]]
            ],
            bottom: 0
        },
        children: {
            resetControl: {
                description: {
                    "class": "TagsViewResetSelectionsControl"
                }
            },
            deleteControl: {
                description: {
                    "class": "TagsViewDeleteControl"
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText
    // 2. iconImage (a path to an svg file)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewControl: {
        "class": o("MinWrapHorizontal", "TrackMyTagsController"),
        position: {
            bottom: 0,
            height: [{ tagControlHeight: _ }, [embedding]]
        },
        children: {
            icon: {
                description: {
                    "class": "TagsViewControlIcon"
                }
            },
            label: {
                description: {
                    "class": "TagsViewControlLabel"
                }
            }
        },
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewControlElement: o(
        { // variant-controller
            qualifier: "!",
            context: {
                hoverOverMyTagsViewControl: [{ inArea: _ }, [embedding]]
            }
        },
        {
            "class": "TrackMyTagsController",
            position: {
                "vertical-center": 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. embedding area should define iconTooltipText
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewControlIcon: {
        "class": o("TagsViewControlIconDesign", "TagsViewControlElement", "Tooltipable"),
        context: {
            tooltipText: [{ iconTooltipText: _ }, [embedding]]
        },
        position: {
            height: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
            width: [densityChoice, [{ fsAppPosConst: { appElementDimension: _ } }, [globalDefaults]]],
            left: 0,
            attachToLabel: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [
                        [embedded, [embedding]],
                        [areaOfClass, "TagsViewControlLabel"]
                    ],
                    type: "left"
                },
                equals: [{ tagConstants: { tagsViewControlIconToLabelSpacing: _ } }, [globalDefaults]]
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewControlLabel: {
        "class": o("TagsViewControlLabelDesign", "DisplayDimension", "TagsViewControlElement"),
        context: {
            displayText: [{ displayText: _ }, [embedding]]
        },
        position: {
            right: 0
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewResetSelectionsControl: {
        "class": o("TagsViewResetSelectionsControlDesign", "TagsViewControl"),
        context: {
            defaultWidth: false, // override AppControl param
            displayText: [{ myApp: { clearStr: _ } }, [me]],
            iconTooltipText: [concatStr,
                o(
                    [{ myApp: { clearStr: _ } }, [me]],
                    [{ myApp: { tagEntityStr: _ } }, [me]],
                    [{ myApp: { selectionEntityStrPlural: _ } }, [me]]
                ),
                " "
            ]
        },
        position: {
            minLeft: {
                point1: {
                    element: [embedding],
                    type: "left",
                    content: true
                },
                point2: {
                    type: "left"
                },
                min: [{ tagControlMargin: _ }, [embedding]]
            },
            attachRightToTagsViewDeleteControl: {
                point1: {
                    type: "right"
                },
                point2: {
                    element: [areaOfClass, "TagsViewDeleteControl"],
                    type: "left"
                },
                equals: [{ tagControlMargin: _ }, [embedding]]
            }
        },
        write: {
            onTagsViewResetSelectionsControlMouseClick: {
                "class": "OnMouseClick",
                true: {
                    resetIncluded: {
                        to: [{ userIncludedTags: _ }, [me]],
                        merge: o()
                    },
                    resetExcluded: {
                        to: [{ userExcludedTags: _ }, [me]],
                        merge: o()
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagsViewDeleteControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tagHovering: [and,
                    [overlap, [me], [pointer]],
                    [{ draggedTag: _ }, [me]]
                ]
            }
        },
        { // default
            "class": o("TagsViewDeleteControlDesign", "TagsViewControl"),
            context: {
                defaultWidth: false, // override AppControl param
                displayText: [{ myApp: { deleteStr: _ } }, [me]],
                iconTooltipText: [concatStr,
                    o(
                        [{ myApp: { dragStr: _ } }, [me]],
                        [{ myApp: { tagEntityStr: _ } }, [me]],
                        [{ myApp: { toStr: _ } }, [me]],
                        [{ myApp: { deleteStr: _ } }, [me]]
                    ),
                    " "
                ],

                enabledTrigger: [{ tagHovering: _ }, [me]] // override OnHoverFrameDesign's default definition
            },
            position: {
                right: [{ tagControlMargin: _ }, [embedding]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTagsController: default value provided by TrackMyTagsController
    // 2. name: uniqueID, by default
    // 3. height: default value provided.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Tag: o(
        { // variant-controller
            qualifier: "!",
            context: {
                userAssignedTag: [
                    [{ uniqueID: _ }, [me]],
                    [{ userAssignedTags: _ }, [me]]
                ],
                deletableTag: [{ userAssignedTag: _ }, [me]]
            }
        },
        { // default
            "class": o("GeneralArea", "MinWrapHorizontal", "WrapAround", "TrackMyTagsController"),
            context: {
                uniqueID: [{ param: { areaSetContent: _ } }, [me]],
                name: [{ uniqueID: _ }, [me]],

                height: [densityChoice, [{ tagConstants: { tagHeight: _ } }, [globalDefaults]]]
            },
            position: {
                height: [{ height: _ }, [me]],
                tagMaxWidth: {
                    point1: { type: "left" },
                    point2: { type: "right" },
                    max: [densityChoice, [{ tagConstants: { maxTagWidth: _ } }, [globalDefaults]]]
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTagsController (default provided via Tag / TrackMyTagsController)
    // 2. deletableTag: true if it is a userAssignedTag
    // 3. deletedTags: a writable reference to the list of deleted tags, to which this tag will be added
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityTag: o(
        { // variant-controller
            qualifier: "!",
            context: {
                showDeleteControl: [and,
                    [{ deletableTag: _ }, [me]],
                    [{ inFocus: _ }, [me]]
                ]
            }
        },
        { // default
            "class": "Tag",
            context: {
                displayText: [{ name: _ }, [me]] // Tag param
            },
            children: {
                name: {
                    description: {
                        "class": "EntityTagName"
                    }
                }
            }
        },
        {
            qualifier: { showDeleteControl: true },
            children: {
                deleteControl: {
                    description: {
                        "class": "DeleteTagControl"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DeleteTagControl: {
        "class": o("DeleteTagControlDesign", "GeneralArea"),
        context: {
            myTag: [embedding],
            dimension: [densityChoice, [{ tagConstants: { tagSelectionControlIconDimension: _ } }, [globalDefaults]]]
        },
        position: {
            width: [{ dimension: _ }, [me]],
            height: [{ dimension: _ }, [me]],
            right: [densityChoice, [{ tagConstants: { deleteTagControlRightMargin: _ } }, [globalDefaults]]],
            "vertical-center": 0
        },
        write: {
            onDeleteTagControlClick: {
                "class": "OnMouseClick",
                true: {
                    deleteTag: {
                        to: [{ myTag: { deletedTags: _ } }, [me]],
                        //merge: push([{ myTag: { uniqueID:_ } }, [me]])
                        merge: o(
                            [{ myTag: { deletedTags: _ } }, [me]],
                            [{ myTag: { uniqueID: _ } }, [me]]
                        )
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. displayText: the name of the tag to be displayed.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableTag: o(
        { // variant-controller
            qualifier: "!",
            context: {
                included: [
                    [{ uniqueID: _ }, [me]],
                    [{ includedTags: _ }, [me]]
                ],
                excluded: [
                    [{ uniqueID: _ }, [me]],
                    [{ excludedTags: _ }, [me]]
                ],
                selected: o(
                    [{ included: _ }, [me]],
                    [{ excluded: _ }, [me]]
                ),
                pointerInLeftPartOfTag: [and,
                    [greaterThan,
                        [offset,
                            { element: [me], type: "left" },
                            { element: [pointer], type: "left" }
                        ],
                        0
                    ],
                    [greaterThan,
                        [offset,
                            { element: [pointer], type: "left" },
                            { element: [me], label: "rightSideOfLeftPart" }
                        ],
                        0
                    ]
                ],
                pointerInCenterPartOfTag: [and,
                    [greaterThan,
                        [offset,
                            { element: [me], label: "rightSideOfLeftPart" },
                            { element: [pointer], type: "left" }
                        ],
                        0
                    ],
                    [greaterThan,
                        [offset,
                            { element: [pointer], type: "left" },
                            { element: [me], label: "leftSideOfRightPart" }
                        ],
                        0
                    ]
                ],
                pointerInRightPartOfTag: [and,
                    [greaterThan,
                        [offset,
                            { element: [me], label: "leftSideOfRightPart" },
                            { element: [pointer], type: "left" }
                        ],
                        0
                    ],
                    [greaterThan,
                        [offset,
                            { element: [pointer], type: "left" },
                            { element: [me], type: "right" }
                        ],
                        0
                    ]
                ]
            }
        },
        { // default
            "class": o("SelectableTagDesign", "Tag"),
            children: {
                name: {
                    description: {
                        "class": "SelectableTagName"
                    }
                }
            },
            position: {
                labelRightSideOfLeftPart: {
                    point1: { type: "left", content: true },
                    point2: { label: "rightSideOfLeftPart" },
                    equals: [densityChoice, [{ tagConstants: { selectionHotspotWidthOnSelectableTag: _ } }, [globalDefaults]]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                labelLeftSideOfRightPart: {
                    point1: { label: "leftSideOfRightPart" },
                    point2: { type: "right", content: true },
                    equals: [densityChoice, [{ tagConstants: { selectionHotspotWidthOnSelectableTag: _ } }, [globalDefaults]]],
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                selectableTagHotspotLabelsDontCross: {
                    point1: { label: "rightSideOfLeftPart" },
                    point2: { label: "leftSideOfRightPart" },
                    min: 0
                }
            },
            write: {
                onSelectableTagMouseClick: {
                    "class": "OnMouseClick",
                    // see variants below
                }
            }
        },
        {
            qualifier: {
                selected: false,
                inFocus: true
            },
            children: {
                includeControl: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SelectableTagIncludeControl"
                    }
                },
                excludeControl: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "SelectableTagExcludeControl"
                    }
                }
            }
        },
        {
            qualifier: {
                selected: false,
                pointerInLeftPartOfTag: true
            },
            write: {
                onSelectableTagMouseClick: {
                    // upon: see default clause above,
                    true: {
                        selectMe: { // this is in case the user clicks on the SelectableTag itself, and not on one of its SelectableTagSelectionControls
                            to: [{ userExcludedTags: _ }, [me]],
                            merge: push([{ uniqueID: _ }, [me]])
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                selected: false,
                pointerInRightPartOfTag: true
            },
            write: {
                onSelectableTagMouseClick: {
                    // upon: see default clause above,
                    true: {
                        selectMe: { // this is in case the user clicks on the SelectableTag itself, and not on one of its SelectableTagSelectionControls
                            to: [{ userIncludedTags: _ }, [me]],
                            merge: push([{ uniqueID: _ }, [me]])
                        }
                    }
                }
            }
        },
        {
            qualifier: { included: true },
            write: {
                onSelectableTagMouseClick: {
                    // upon: see default clause above
                    true: {
                        unincludeMe: {
                            to: [
                                [{ uniqueID: _ }, [me]],
                                [{ userIncludedTags: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { excluded: true },
            write: {
                onSelectableTagMouseClick: {
                    // upon: see default clause above
                    true: {
                        unexcludedMe: {
                            to: [
                                [{ uniqueID: _ }, [me]],
                                [{ userExcludedTags: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: { userAssignedTag: true },
            "class": o("IconableWhileDraggableOnMove", "ModalDialogableOnDragAndDrop"),
            context: {
                // ModalDialogableOnDragAndDrop params
                conditionsForModalDialogable: [and,
                    [{ tagHovering: _ }, [areaOfClass, "TagsViewDeleteControl"]],
                    [ // check that the draggedTag pertains to me!
                        { myTag: [me] },
                        [{ draggedTag: _ }, [me]]
                    ]
                ]
            },
            write: {
                onSelectableTagOnAct: { // the global deletion of this tag!
                    upon: [{ enabledActModalDialogActControl: _ }, [me]],
                    true: {
                        removeFromUserDefinedTags: {
                            to: [{ userDefinedTags: _ }, [me]],
                            merge: [
                                n([{ uniqueID: _ }, [me]]),
                                [{ userDefinedTags: _ }, [me]]
                            ]
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                userAssignedTag: true,
                createIconWhileInOperation: true
            },
            children: {
                iconWhileInOperation: {
                    // see IconableWhileDraggableOnMove for partner definition
                    description: {
                        "class": "DraggedTag"
                    }
                }
            }
        },
        {
            qualifier: {
                userAssignedTag: true,
                createModalDialog: true
            },
            children: {
                modalDialog: {
                    // partner: defined by ModalDialogable
                    description: {
                        "class": "TagGlobalDeleteModalDialog"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                ofDeletableTag: [{ deletableTag: _ }, [embedding]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                name: [{ name: _ }, [embedding]],
                displayText: [{ name: _ }, [me]]
            },
            position: {
                top: 0,
                bottom: 0,
                contentWidth: {
                    point1: {
                        type: "left",
                        content: true
                    },
                    point2: {
                        type: "right",
                        content: true
                    },
                    equals: [displayWidth],
                    // this will lose out to the maxWidth constraint in Tag.
                    priority: positioningPrioritiesConstants.weakerThanDefault
                },
                left: 0
            }
        },
        {
            qualifier: { ofDeletableTag: false },
            context: {
                displayText: [concatStr, o("*", [{ name: _ }, [me]])]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityTagName: o(
        {
            "class": o("EntityTagNameDesign", "TagName"),
        },
        {
            qualifier: { ofDeletableTag: true },
            position: {
                right: [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]] // leave room for the delete control on hover!
            }
        },
        {
            qualifier: { ofDeletableTag: false },
            position: {
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableTagName: o(
        { // variant-controller
            qualifier: "!",
            context: {
                selected: [{ selected: _ }, [embedding]],
                hoverOverMyTag: [{ inFocus: _ }, [embedding]]
            }
        },
        { // default
            "class": o("SelectableTagNameDesign", "TagName"),
            position: {
                right: 0
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. enabled: a boolean
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableTagSelectionControl: o(
        { // default
            "class": o("GeneralArea", "Icon", "TrackMyTagsController"),
            context: {
                uniqueID: [{ mySelectableTag: { uniqueID: _ } }, [me]],
                mySelectableTag: [expressionOf],
                myTagsController: [{ mySelectableTag: { myTagsController: _ } }, [me]]
            },
            position: {
                alignVertiallyWithMyTag: {
                    point1: {
                        element: [{ mySelectableTag: _ }, [me]],
                        type: "vertical-center"
                    },
                    point2: {
                        type: "vertical-center"
                    },
                    equals: 0
                },
                // horiontal constraint - see inheriting classes
                height: [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]],
                width: [plus,
                    [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]],
                    // this tagSelectionControlExternalMargin is what creates the white sliver between the external horizontal edge of these controls
                    // and the adjacet SelectableTag 
                    [densityChoice, [{ tagConstants: { tagSelectionControlExternalMargin: _ } }, [globalDefaults]]]
                ]
            },
            children: {
                visibleControl: {
                    description: {
                        propagatePointerInArea: "embedding",
                        position: {
                            top: 0,
                            bottom: 0,
                            width: [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]]
                            // horizontal constraint - see inheriting classes
                        }
                    }
                }
            },
            write: {
                onSelectableTagSelectionControlMouseClick: {
                    "class": "OnMouseClick",
                    // true: see variants below
                }
            }
        },
        {
            qualifier: { enabled: true },
            children: {
                visibleControl: {
                    description: {
                        "class": "Tooltipable",
                        propagatePointerInArea: "embedding", // override Tooltipable's definition
                        context: {
                            tooltipText: [{ visibleControlTooltipText: _ }, [embedding]] // see inheriting classes
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableTagIncludeControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: o(
                    [{ inFocus: _ }, [me]],
                    [{ mySelectableTag: { pointerInRightPartOfTag: true } }, [me]],
                    [{ mySelectableTag: { pointerInCenterPartOfTag: true } }, [me]]
                )
            }
        },
        { // default
            "class": o("SelectableTagIncludeControlDesign", "SelectableTagSelectionControl"),
            position: {
                attachLeftToMySelectableTagRight: {
                    point1: {
                        element: [{ mySelectableTag: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: 0
                }
            },
            children: {
                visibleControl: {
                    description: {
                        position: {
                            left: 0
                        }
                    }
                }
            },
            write: {
                onSelectableTagSelectionControlMouseClick: {
                    // upon: see default clause
                    true: {
                        includeTag: {
                            to: [{ userIncludedTags: _ }, [me]],
                            merge: push([{ uniqueID: _ }, [me]])
                        },
                        removeFromExcluded: { // as a tag can be either included, or excluded. not both
                            to: [
                                [{ uniqueID: _ }, [me]],
                                [{ userExcludedTags: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SelectableTagExcludeControl: o(
        { // variant-controller
            qualifier: "!",
            context: {
                enabled: o(
                    [{ inFocus: _ }, [me]],
                    [{ mySelectableTag: { pointerInLeftPartOfTag: true } }, [me]],
                    [{ mySelectableTag: { pointerInCenterPartOfTag: true } }, [me]]
                )
            }
        },
        { // default
            "class": o("SelectableTagExcludeControlDesign", "SelectableTagSelectionControl"),
            position: {
                attachRightToMySelectableTagLeft: {
                    point1: {
                        type: "right"
                    },
                    point2: {
                        element: [{ mySelectableTag: _ }, [me]],
                        type: "left"
                    },
                    equals: 0
                }
            },
            children: {
                visibleControl: {
                    description: {
                        position: {
                            right: 0
                        }
                    }
                }
            },
            write: {
                onSelectableTagSelectionControlMouseClick: {
                    // upon: see default clause
                    true: {
                        excludeTag: {
                            to: [{ userExcludedTags: _ }, [me]],
                            merge: push([{ uniqueID: _ }, [me]])
                        },
                        removeFromIncluded: { // as a tag can be either included, or excluded. not both. if it wasn't included to begin with - no harm done.
                            to: [
                                [{ uniqueID: _ }, [me]],
                                [{ userIncludedTags: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTagsController: default defined by TrackMyTagsController 
    // 2. tags: an os of all tags assigned to this entity (whether explicitly by the user, preloadedTags, appTags, etc.)
    // 3. userAssignedTags: a writable reference
    // 4. deletedTags: a writable reference to the os of tags that were explicitly deleted by the user for this entity.
    // 5. tagHovering: a boolean indicating whether a dragged tag is hovering over this entity, to allow
    //    the inheriting area to give the user some UX feedback. default definition provided (a DraggedTag area exists, and the pointer is in the TaggableEntity)
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TaggableEntity: o(
        { // variant-controller
            qualifier: "!",
            context: {
                tagHovering: [and,
                    [overlap, [me], [pointer]],
                    [{ draggedTag: _ }, [me]],
                    [not, [{ tagAlreadyAssigned: _ }, [me]]]
                ],
                myOpenAddTagMenu: [
                    { myTaggableEntity: [me] },
                    [areaOfClass, "EntityAddTagMenu"]
                ],
                readyToAddTag: o(
                    [{ tagHovering: _ }, [me]],
                    [{ myOpenAddTagMenu: _ }, [me]]
                )
            }
        },
        { // default
            "class": o("GeneralArea", "TrackMyTagsController"),
            context: {
                tagAlreadyAssigned: [
                    [{ draggedTag: { uniqueID: _ } }, [me]],
                    [{ tags: _ }, [me]]
                ]
            }
        },
        {
            qualifier: { readyToAddTag: true },
            write: {
                onTaggableEntityAddTag: {
                    // see variants below
                    true: {
                        assignTag: {
                            to: [{ userAssignedTags: _ }, [me]],
                            merge: push([{ tagUniqueID: _ }, [me]])
                        },
                        removeTagFromDeletedTags: { // was there only if the user previously explicitly deleted it!
                            to: [
                                [{ tagUniqueID: _ }, [me]],
                                [{ deletedTags: _ }, [me]]
                            ],
                            merge: o()
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                readyToAddTag: true,
                tagHovering: true
            },
            context: {
                tagUniqueID: [{ draggedTag: { uniqueID: _ } }, [me]]
            },
            write: {
                onTaggableEntityAddTag: {
                    "class": "OnMouseUp"
                    // true: see { readyToAddTag: true } variant above
                }
            }
        },
        {
            qualifier: {
                readyToAddTag: true,
                myOpenAddTagMenu: true
            },
            context: {
                tagUniqueID: [
                    {
                        myTaggableEntity: [me],
                        clicked: true,
                        tagUniqueID: _
                    },
                    [areaOfClass, "EntityTagMenuLine"]
                ]
            },
            write: {
                onTaggableEntityAddTag: {
                    upon: [{ tagUniqueID: _ }, [me]]
                    // true: see { readyToAddTag: true } variant above
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    DraggedTag: {
        "class": o("DraggedTagDesign", "DraggableIcon", "DisplayDimension"),
        context: {
            myTag: [expressionOf],
            myTagsController: [{ myTag: { myTagsController: _ } }, [me]],
            uniqueID: [{ myTag: { uniqueID: _ } }, [me]],
            displayText: [{ uniqueID: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagGlobalDeleteModalDialog: {
        "class": "OKCancelModalDialog",
        children: {
            textDisplay: {
                description: {
                    "class": "TagGlobalDeleteModalDialogText"
                }
            },
            okControl: {
                description: {
                    "class": "TagGlobalDeleteModalDialogOKControl"
                }
            }
            // cancelControl defined in OKCancelModalDialog
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TagGlobalDeleteModalDialogText: {
        "class": o("OKCancelDialogText", "TrackMyTagsController"),
        context: {
            myTag: [{ myModalDialogable: _ }, [me]],
            objsTaggedWithMyTag: [
                { tags: [{ myTag: { uniqueID: _ } }, [me]] },
                [{ myTag: { myTagsController: { tagsData: _ } } }, [me]]
            ],
            numObjsTaggedWithMyTag: [size, [{ objsTaggedWithMyTag: _ }, [me]]],

            displayText: [concatStr,
                o(
                    [
                        [{ myApp: { trashDialogBoxConfirmationTextGenerator: _ } }, [me]],
                        [{ myTag: { uniqueID: _ } }, [me]],
                        [{ myApp: { tagEntityStr: _ } }, [me]]
                    ],
                    [cond,
                        [greaterThan, [{ numObjsTaggedWithMyTag: _ }, [me]], 0],
                        o(
                            {
                                on: true,
                                use: [concatStr,
                                    o(
                                        "\n",
                                        [{ myApp: { itStr: _ } }, [me]],
                                        [{ myApp: { isStr: _ } }, [me]],
                                        [{ myApp: { usedStr: _ } }, [me]],
                                        [{ myApp: { inStr: _ } }, [me]],
                                        [{ numObjsTaggedWithMyTag: _ }, [me]],
                                        [cond,
                                            [greaterThan, [{ numObjsTaggedWithMyTag: _ }, [me]], 1],
                                            o(
                                                { on: true, use: [{ myApp: { tagEntityStrPlural: _ } }, [me]] },
                                                { on: false, use: [{ myApp: { tagEntityStr: _ } }, [me]] }
                                            )
                                        ]
                                    ),
                                    " "
                                ]
                            }
                        )
                    ]
                )
            ]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the OK control in the modal dialog confirming the global deletion of a tag
    /////////////////////////////////////////////////////////////////////////////////////////////////////////   
    TagGlobalDeleteModalDialogOKControl: {
        "class": "OKCancelDialogOKControl"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddSelectableTagContainer: {
        "class": o(
            "AddSelectableTagContainerDesign",
            "GeneralArea",
            "WrapAround", // to allow it to be positioned first in the TagsDoc
            "MinWrapHorizontal", // to minimially wrap its embedded areas - not to be confused with WrapAround!
            "TrackMyTagsController"
        ),
        children: {
            addTagControl: {
                description: {
                    "class": "AddSelectableTagControl"
                }
            },
            addTagInput: {
                description: {
                    "class": "AddSelectableTagInput"
                }
            }
        },
        position: {
            height: [densityChoice, [{ tagConstants: { tagHeight: _ } }, [globalDefaults]]],
            minRightFromEmbedding: {  // this area insists on having sufficent width in its embedding area 
                point1: { type: "right" },
                point2: {
                    element: [embedding],
                    type: "right",
                    content: true
                },
                min: 0
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddSelectableTagInput: o(
        { // default
            "class": o("AddSelectableTagInputDesign", "GeneralArea", "TextInput", "TrackMyTagsController"),
            context: {
                myAddSelectableTagControl: [
                    { myTagsController: [{ myTagsController: _ }, [me]] },
                    [areaOfClass, "AddSelectableTagControl"]
                ],
                // TextInput params
                placeholderInputText: [concatStr,
                    o(
                        [{ myApp: { addStr: _ } }, [me]],
                        //[{ myApp: { newStr: _ } }, [me]],
                        [{ myApp: { tagEntityStr: _ } }, [me]]
                    ),
                    " "
                ],
                inputTextValuesAlreadyUsed: [{ tags: _ }, [me]],
                immuneFromTurningOffEditInputOnMouseDown: [{ myAddSelectableTagControl: _ }, [me]],
                allowWritingInput: false, // not using the TextInput area to write to AD, but rathe to push to the os of tags
                enableBoxShadow: false,

                marginFromEmbedding: 1
            },
            position: {
                attachToAddTagControl: {
                    point1: {
                        element: [{ myAddSelectableTagControl: _ }, [me]],
                        type: "right"
                    },
                    point2: {
                        type: "left"
                    },
                    equals: [{ marginFromEmbedding: _ }, [me]]
                },
                right: [{ marginFromEmbedding: _ }, [me]],
                width: [densityChoice, [{ tagConstants: { addSelectableTagTextInputWidth: _ } }, [globalDefaults]]],
                top: [{ marginFromEmbedding: _ }, [me]],
                bottom: [{ marginFromEmbedding: _ }, [me]]
            }
        },
        {
            qualifier: { editInputText: false },
            write: {
                onAddFacetTagInputAction: {
                    // clicking on the AddSelectableTagControl switches this field to edit mode
                    upon: [clickHandledBy, [{ myAddSelectableTagControl: _ }, [me]]],
                    true: {
                        editInputTextOff: {
                            to: [{ editInputText: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: {
                editInputText: true,
                defaultAllowWritingInput: true,
                editedInputTextAlreadyBeingUsed: false
            },
            write: {
                onAddFacetTagInputAction: {
                    upon: o(
                        enterEvent,
                        [clickHandledBy, [{ myAddSelectableTagControl: _ }, [me]]]
                    ),
                    true: {
                        addNewTag: {
                            to: [{ userDefinedTags: _ }, [me]],
                            merge: o(
                                [{ textForAppData: _ }, [me]],
                                [{ userDefinedTags: _ }, [me]]
                            )
                        },
                        editInputTextOff: {
                            to: [{ editInputText: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    AddSelectableTagControl: {
        "class": o("AddSelectableTagControlDesign", "AppControl", "TrackMyTagsController"),
        context: {
            defaultHeight: false // AppControl param
        },
        position: {
            top: 0,
            bottom: 0,
            left: 0
            // right: see AddSelectableTagInput
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. a child which inherits EntityTagsDoc
    // 2. positioning/dimensions
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityTagsView: {
        "class": o("GeneralArea", "VerticalContMovableController", "TrackMyTagsController"),
        context: {
            myScrollbar: [{ children: { verticalScrollbar: _ } }, [me]],
            myTagsDoc: [
                [embedded],
                [areaOfClass, "EntityTagsDoc"]
            ],

            // VerticalContMovableController params
            beginningOfDocPoint: atomic({
                element: [{ myTagsDoc: _ }, [me]],
                type: "top"
            }),
            endOfDocPoint: atomic({
                element: [{ myTagsDoc: _ }, [me]],
                type: "bottom"
            })
        },
        position: {
            height: [{ myTagsController: { entityTagsViewHeight: _ } }, [me]]
        },
        children: {
            verticalScrollbar: {
                description: {
                    "class": "VerticalScrollbarContainer",
                    context: {
                        movableController: [embedding],
                        attachToView: "end",
                        attachToViewOverlap: true,
                        showOnlyWhenInView: false,
                        scrollbarMarginFromViewLengthAxisEdge: 0
                    }
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. this area should embed an areaSet of tags, which inherit EntityTag.
    // 2. WrapAroundController API
    // 3. left/right positioning constraints
    // 4. myTaggableEntity: an areaRef to the associated area inheriting TaggableEntity
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityTagsDoc: {
        "class": o("GeneralArea", "HorizontalWrapAroundController", "MinWrapVertical", "TrackMyTagsController"),
        context: {
            myTagsController: [{ myTaggableEntity: { myTagsController: _ } }, [me]], // override default TrackMyTagsController value     
            myEntityAddTagControl: [ // assumes the EntityAddTagControl is directly embedded!
                [embedded],
                [areaOfClass, "EntityAddTagControl"]
            ],
            minWrapTop: [{ wrapAroundSecondaryAxisSpacing: _ }, [me]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myTaggableEntity: an areaRef to the associated area inheriting TaggableEntity
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityAddTagControl: o(
        { // default
            "class": o("EntityAddTagControlDesign", "GeneralArea", "AppControl", "MoreControlsController", "MoreControlsOnClickUXCore",
                "DropDownMenuable", "TrackMyTagsController"),
            context: {
                // override MoreControlsOnClickUXCore params
                myMoreControlsController: [me],
                horizontalOffsetToMenu: [{ tagConstants: { horizontalOffsetToAddTagDropdownMenu: _ } }, [globalDefaults]],

                // AppControl params
                tooltipText: [concatStr,
                    o(
                        [{ myApp: { addStr: _ } }, [me]],
                        [{ myTaggableEntity: { taggableEntityStr: _ } }, [me]],
                        [{ myApp: { tagEntityStr: _ } }, [me]]
                    ),
                    " "
                ],
                defaultHeight: false,
                defaultWidth: false,

                myTagsController: [{ myTaggableEntity: { myTagsController: _ } }, [me]], // override default TrackMyTagsController value

                // DropDownMenuable params:
                createDropDownMenu: [{ moreControlsOpen: _ }, [me]],
                immunityFromClosingDropDownMenuOnMouseDown: [me],
                displayDropDownShowControl: false,
                displayMenuSelection: false,
                dropDownMenuLogicalSelectionsOS: [{ sortedUserAssignedTags: _ }, [me]],
                dropDownMenuSearchBoxPlaceholderInputText: [concatStr,
                    o(
                        [{ myApp: { addStr: _ } }, [me]],
                        [{ myApp: { tagEntityStrPlural: _ } }, [me]]
                    ),
                    " "
                ]
            },
            position: {
                height: [densityChoice, [{ tagConstants: { tagHeight: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { moreControlsOpen: true },
            context: {
                createTooltip: false
            },
            children: {
                menu: {
                    "class": "PartnerWithIconEmbedding",
                    description: {
                        "class": "EntityAddTagMenu"
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    EntityAddTagMenu: {
        "class": o("EntityAddTagMenuDesign", "DropDownMenu", "MoreControlsMenu"),
        context: {
            myTaggableEntity: [{ myDropDownMenuable: { myTaggableEntity: _ } }, [me]],
            // dropDownMenu params
            defaultDropDownMenuPositioningLeft: false,
            defaultDropDownMenuPositioningRight: false,
            defaultDropDownMenuPositioningTop: false,
            scrollbar: {
                attachToView: "end",
                attachToViewOverlap: true
            },
            showTriangle: false, // for now
            // menu positioned vertically 1/2 line height above its moreControl's top:
            verticalAnchorOfMenu: atomic({
                type: "top"
            }),
            offsetOfVerticaAnchorForMenu: [div, [{ menuLineHeight: _ }, [me]], 2]
        },
        propagatePointerInArea: o(), // to avoid triggering the EntityAddTagControl tooltip 
        children: {
            dropDownMenuList: {
                description: {
                    children: {
                        lines: { // adding to the definition of the DropDownMenuLine areaSet defined in DropDownMenuList
                            description: {
                                "class": "EntityTagMenuLine"
                            }
                        }
                    }
                }
            }
        },
        position: {
            width: [densityChoice, [{ tagConstants: { maxTagWidth: _ } }, [globalDefaults]]]
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////    
    EntityTagMenuLine: {
        "class": o("EntityTagMenuLineDesign", "GeneralArea", "DropDownMenuLine"),
        context: {
            myTaggableEntity: [{ myDropDownMenuable: { myTaggableEntity: _ } }, [me]],

            tagUniqueID: [{ param: { areaSetContent: _ } }, [me]],

            // DropDownMenuLine params
            displayText: [{ tagUniqueID: _ }, [me]],
            actOnEnterOrClick: false, // override default

            clicked: mouseClickEvent// observed by the TaggableEntity!
        }
        // adding a tag to an entity - see write handler in TaggableEntity
    }

};