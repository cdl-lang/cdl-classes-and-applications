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

initGlobalDefaults.appSettingsControlsDesign = {
    appAboutModalDialogTitleTextSize: 24,
    appAboutModalDialogDocTitleTextSize: 14,
    appAboutModalDialogDocTextSize: 11,
    appAboutModalDialogDocCitationTextSize: 10
};

var classes = {
        ///////////////////////////////////////////////
    FSAppUserMenuControllerDesign: {
        "class": "SandwichMenuControllerDesign"
    },

    ///////////////////////////////////////////////
    AppStateConnectionIndicatorDesign: o(
        { // default
            display: {
                image: {
                    size: "100%"
                }
            }
        },
        {
            qualifier: {
                appStateRemotingServerAddress: true,
                appStateRemotingErrorId: 0
            },
            display: {
                image: {
                    src: "%%image:(appStateRemoteConnected.svg)%%",
                    alt: "Connected"
                }
            }
        },
        {
            qualifier: {
                appStateRemotingServerAddress: true,
                appStateRemotingErrorId: 1
            },
            display: {
                image: {
                    src: "%%image:(appStateRemoteDisconnected.svg)%%",
                    alt: "Disconnected"
                }
            }
        },
        {
            qualifier: { appStateRemotingServerAddress: false },
            display: {
                image: {
                    src: "%%image:(appStateLocal.svg)%%",
                    alt: "Local Mode"
                }
            }
        }
    ),

    ///////////////////////////////////////////////
    AppAboutModalDialogDesign: {
        context: {
            borderWidth: 2,
            borderColor: "#535353",
            textColor: "#000000"
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogElementTextDesign: {
        "class": o("DefaultDisplayText", "ModalDialogElement"),
        context: {
            textColor: [{ myDialog: { textColor:_ } }, [me]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogTitleDesign: {
        "class": o("TextAlignCenter", "TextUpperCase", "AppAboutModalDialogElementTextDesign"),
        context: {
            textSize: [{ appSettingsControlsDesign: { appAboutModalDialogTitleTextSize:_ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogViewSeparatorDesign: {
        "class": "BackgroundColor",
        context: {
            backgroundColor: [{ myDialog: { borderColor:_ }}, [me]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogDocTitleDesign: {
        "class": o("TextBold", "AppAboutModalDialogElementTextDesign"),
        context: {
            textSize: [{ appSettingsControlsDesign: { appAboutModalDialogDocTitleTextSize:_ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogDocTextDesign: {
        "class": "AppAboutModalDialogElementTextDesign",
        context: {
            textSize: [{ appSettingsControlsDesign: { appAboutModalDialogDocTextSize:_ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogDocCitationDesign: {
        "class": o("TextItalic", "AppAboutModalDialogElementTextDesign"),
        context: {
            textSize: [{ appSettingsControlsDesign: { appAboutModalDialogDocCitationTextSize:_ } }, [globalDefaults]]
        }
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogParagraphTitleDesign: {
        "class": "AppAboutModalDialogDocTitleDesign"
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogParagraphTextDesign: {
        "class": "AppAboutModalDialogDocTextDesign"
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogParagraphBulletPointsDesign: {
        "class": "AppAboutModalDialogDocTextDesign"
    },

    ///////////////////////////////////////////////
    AppAboutModalDialogDocOpenSourceListDesign: {
        "class": "AppAboutModalDialogDocCitationDesign"
    }
};


