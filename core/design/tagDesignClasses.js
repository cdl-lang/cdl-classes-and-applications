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

initGlobalDefaults.tagDesignConstants = {
    tagBackgroundColor: "#c5e2cd",
    tagTextColor: "#0c1e1a",
    tagTextSize: { "V1": 9, "V2": 11, "V3": 14 },
    includedTagBackgroundColor: "#89e7a4",
    includedTagBorderColor: "#9a9a9a",
    selectableTagBorderWidth: { "V1": 1, "V2": 1, "V3": 2 },
    selectedTagBackgroundColorOnHover: "#5bae73",
    selectedTagTextColorOnHover: "white",
    includeTagControlBackground: "#4dbc00",
    excludeTagControlBackground: "#c32800",
    disabledTagControlBackground: "#c5c5c5",
    tagViewControlTextColor: "#9a9a9a",
    tagViewControlTextColorOnHover: "#353535",
    tagNameHorizontalPadding: { "V1": 4, "V2": 5, "V3": 7 }
};

var classes = {

    ///////////////////////////////////////////////
    AddSelectableTagContainerDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ tagDesignConstants: { tagBackgroundColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    AddSelectableTagControlDesign: {
        "class": "AddTagControlDesign"
    },

    ///////////////////////////////////////////////
    AddSelectableTagInputDesign: {
        "class": "TagNameDesign",
        context: {
            padding: 0
        }
    },

    ///////////////////////////////////////////////
    TagDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ tagDesignConstants: { tagBackgroundColor: _ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    SelectableTagDesign: o(
        { // default
            "class": o("Border", "TagDesign"),
            context: {
                borderWidth: [densityChoice, [{ tagDesignConstants: { selectableTagBorderWidth: _ } }, [globalDefaults]]]
            }
        },
        {
            qualifier: { inFocus: true },
            context: {
                backgroundColor: [cond,
                    [{ selected: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ tagDesignConstants: { includedTagBackgroundColor: _ } }, [globalDefaults]]
                        },
                        {
                            on: true,
                            use: [{ tagDesignConstants: { selectedTagBackgroundColorOnHover: _ } }, [globalDefaults]]
                        }
                    )
                ]
            }
        },
        {
            qualifier: {
                included: true,
                inFocus: false
            },
            context: {
                backgroundColor: [{ tagDesignConstants: { includedTagBackgroundColor: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { included: false },
            context: {
                borderColor: [{ tagDesignConstants: { tagBackgroundColor: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { included: true },
            context: {
                borderColor: [{ tagDesignConstants: { includedTagBorderColor: _ } }, [globalDefaults]]
            }
        },
        {
            qualifier: { excluded: true },
            // see the embedded TagNameDesign class 
        }
    ),

    ///////////////////////////////////////////////
    TagNameDesign: {
        "class": o("DefaultDisplayText", "HorizontalPaddingDesign", "TextOverflowEllipsisDesign"),
        context: {
            textSize: [densityChoice, [{ tagDesignConstants: { tagTextSize: _ } }, [globalDefaults]]],
            textColor: [{ tagDesignConstants: { tagTextColor: _ } }, [globalDefaults]],
            padding: [densityChoice, [{ tagDesignConstants: { tagNameHorizontalPadding: _ } }, [globalDefaults]]]
        }
    },

    ///////////////////////////////////////////////
    EntityTagNameDesign: {
        "class": "TagNameDesign"
    },

    //////////////////////////////////////////////////////
    AddTagControlDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ tagDesignConstants: { tagBackgroundColor: _ } }, [globalDefaults]]
        },
        position: {
            height: [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]],
            width: [densityChoice, [{ tagConstants: { tagSelectionControlDimension: _ } }, [globalDefaults]]]
        },
        children: {
            img: {
                description: {
                    position: {
                        "class": "AlignCenterWithEmbedding",
                        width: [densityChoice, [{ tagConstants: { tagSelectionControlIconDimension: _ } }, [globalDefaults]]],
                        height: [densityChoice, [{ tagConstants: { tagSelectionControlIconDimension: _ } }, [globalDefaults]]]
                    },
                    display: {
                        image: {
                            size: "100%",
                            src: "%%image:(addTag.svg)%%",
                            alt: "Add Tag"
                        }
                    }
                }
            }
        }
    },

    //////////////////////////////////////////////////////
    EntityAddTagControlDesign: {
        "class": "AddTagControlDesign"
    },

    ///////////////////////////////////////////////
    SelectableTagNameDesign: o(
        { // variant-controller
            qualifier: "!",
            context: {
                excluded: [{ excluded: _ }, [embedding]]
            }
        },
        { // default
            "class": "TagNameDesign"
        },
        {
            qualifier: { excluded: true },
            "class": "TextLineThrough"
        },
        {
            qualifier: {
                selected: true,
                hoverOverMyTag: true
            },
            context: {
                backgroundColor: [{ tagDesignConstants: { selectedTagBackgroundColorOnHover: _ } }, [globalDefaults]],
                textColor: [{ tagDesignConstants: { selectedTagTextColorOnHover: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    ShowTagsViewPaneControlDesign: o(
        { // default
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: { showTagsViewPane: false },
            display: {
                image: {
                    src: "%%image:(closedTagPanel.svg)%%",
                    alt: "Show Tag Pane"
                }
            }
        },
        {
            qualifier: {
                showTagsViewPane: false,
                selectedTags: true
            },
            display: {
                image: {
                    src: "%%image:(closedLoadedTagPanel.svg)%%"
                }
            }
        },
        {
            qualifier: { showTagsViewPane: true },
            display: {
                image: {
                    src: "%%image:(openedTagPanel.svg)%%",
                    alt: "Hide Tag Pane"
                }
            }
        },
        {
            qualifier: {
                showTagsViewPane: true,
                selectedTags: true
            },
            display: {
                image: {
                    src: "%%image:(closedLoadedTagPanel.svg)%%"
                },
                transform: {
                    rotate: 90
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    TagsViewControlDesign: {
    },

    ///////////////////////////////////////////////
    TagsViewResetSelectionsControlDesign: {
        "class": "TagsViewControlDesign",
        context: {
            iconImage: "%%image:(resetTagSelections.svg)%%"
        }
    },

    ///////////////////////////////////////////////
    TagsViewDeleteControlDesign: {
        "class": "TagsViewControlDesign",
        context: {
            iconImage: "%%image:(trashTag.svg)%%"
        }
    },

    ///////////////////////////////////////////////
    DeleteTagControlDesign: {
        display: {
            image: {
                size: "100%",
                src: "%%image:(deleteTag.svg)%%",
                alt: "Delete Tag"
            }
        }
    },

    ///////////////////////////////////////////////
    SelectableTagUserAssignedIndicatorDesign: {
        /*"class": "BackgroundColor", no indicator for now
        context: {
            backgroundColor: "black" // awaiting yuval's specs
        }*/
    },

    ///////////////////////////////////////////////
    DraggedTagDesign: {
        "class": "DraggableIconDesign"
    },

    ///////////////////////////////////////////////
    EntityAddTagMenuDesign: {
        "class": o("DropDownMenuDesign", "BackgroundColor"),
    },

    ///////////////////////////////////////////////
    EntityTagMenuLineDesign: {
        "class": "DropDownMenuLineDesign"
    },

    ///////////////////////////////////////////////
    SelectableTagSelectionControlDesign: o(
        { // default
            "class": "BackgroundColor",
            context: {
                visibleControlBackgroundColor: [{ defaultBackgroundColor: _ }, [me]],
            },
            children: {
                visibleControl: {
                    description: {
                        "class": "BackgroundColor",
                        context: {
                            backgroundColor: [{ visibleControlBackgroundColor: _ }, [embedding]]
                        },
                        children: {
                            img: {
                                description: {
                                    propagatePointerInArea: "embedding",
                                    position: {
                                        "class": "AlignCenterWithEmbedding",
                                        width: [densityChoice, [{ tagConstants: { tagSelectionControlIconDimension: _ } }, [globalDefaults]]],
                                        height: [densityChoice, [{ tagConstants: { tagSelectionControlIconDimension: _ } }, [globalDefaults]]]
                                    },
                                    display: {
                                        image: {
                                            size: "100%"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { enabled: false },
            context: {
                visibleControlBackgroundColor: [{ tagDesignConstants: { disabledTagControlBackground: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    SelectableTagIncludeControlDesign: o(
        { // default
            "class": "SelectableTagSelectionControlDesign",
            children: {
                visibleControl: {
                    description: {
                        children: {
                            img: {
                                description: {
                                    display: {
                                        image: {
                                            src: "%%image:(includeTag.svg)%%",
                                            alt: "Include Tag"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { enabled: true },
            context: {
                visibleControlBackgroundColor: [{ tagDesignConstants: { includeTagControlBackground: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    SelectableTagExcludeControlDesign: o(
        { // default
            "class": "SelectableTagSelectionControlDesign",
            children: {
                visibleControl: {
                    description: {
                        children: {
                            img: {
                                description: {
                                    display: {
                                        image: {
                                            src: "%%image:(excludeTag.svg)%%",
                                            alt: "Exclude Tag"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            qualifier: { enabled: true },
            context: {
                visibleControlBackgroundColor: [{ tagDesignConstants: { excludeTagControlBackground: _ } }, [globalDefaults]]
            }
        }
    ),

    ///////////////////////////////////////////////
    TagsViewControlLabelDesign: {
        "class": o("TextAlignCenter", "DefaultDisplayText", "HorizontalPaddingDesign"),
        context: {
            textSize: [densityChoice, [{ tagDesignConstants: { tagTextSize: _ } }, [globalDefaults]]],
            textColor: [cond,
                [{ hoverOverMyTagsViewControl: _ }, [me]],
                o(
                    {
                        on: false,
                        use: [{ tagDesignConstants: { tagViewControlTextColor: _ } }, [globalDefaults]]
                    },
                    {
                        on: true,
                        use: [{ tagDesignConstants: { tagViewControlTextColorOnHover: _ } }, [globalDefaults]]
                    }
                )
            ]
        }
    },

    ///////////////////////////////////////////////
    TagsViewControlIconDesign: {
        display: {
            image: {
                size: "100%",
                src: [{ iconImage: _ }, [embedding]]
            }
        }
    }
};