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

// %%classfile%%: "help.js"
// %%include%%: "../18_BasicClasses/events.js"

// Note: username and email are the same when signing up, and logging in, so
// the user will not have to enter some made-up user name.

var classes = {
    LoginScreen: {
        "class": "FocusRingContext",
        context: {
            "*email": o(),
            "*password": o(),
            focusAreas: o(
                [{children: {emailInput: _}}, [me]],
                [{children: {passWordInput: _}}, [me]]
            )
        },
        display: {
            borderRadius: 0
        },
        position: {
            width: 500,
            height: 200
        },
        children: {
            text1: {
                description: {
                    "class": { name: "TextLabel14Px", text: "login to save changes" },
                    position: {
                        top: 5,
                        left: 5,
                        height: 20,
                        width: [displayWidth]
                    }
                }
            },
            text2: {
                description: {
                    "class": o(
                        { name: "UnderlinedTextLabel14Px", text: "or create an account" },
                        { name: "FlipButton", value: [{createAccount: _}, [myContext, "App"]] }
                    ),
                    position: {
                        "class": { name: "RightOfSibling", sibling: "text1", distance: 3 },
                        top: 5,
                        height: 20,
                        right: 0
                    }
                }
            },
            errorMsg: {
                description: {
                    display: {
                        text: {
                            "class": "Font",
                            fontSize: 14,
                            fontWeight: 400,
                            color: "red",
                            textAlign: "left",
                            value: [
                                translateError,
                                [{loginStatus: _}, [tempAppStateConnectionInfo]]
                            ]
                        }
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "text1", distance: 5 },
                        left: 5,
                        height: 20,
                        right: 0
                    }
                }
            },
            emailLabel: {
                description: {
                    "class": { name: "TextLabel14Px", text: "email" },
                    position: {
                        top: 65,
                        left: 60,
                        height: 20,
                        width: 80
                    }
                }
            },
            emailInput: {
                description: {
                    "class": o("TextValueInput", "FocusRing"),
                    context: {
                        value: [{email: _}, [embedding]],
                        type: "text",
                        editMode: true
                    },
                    display: {
                        text: {
                            fontSize: 14,
                            fontWeight: 300,
                            textAlign: "left",
                            input: {
                                init: {
                                    focus: true
                                }
                            }
                        }
                    },
                    position: {
                        top: 65,
                        left: 200,
                        height: 20,
                        width: 200
                    }
                }
            },
            passWordLabel: {
                description: {
                    "class": { name: "TextLabel14Px", text: "password" },
                    position: {
                        bottom: 85,
                        left: 60,
                        height: 20,
                        width: 80
                    }
                }
            },
            passWordInput: {
                description: {
                    "class": o("TextValueInput", "FocusRing"),
                    context: {
                        value: [{password: _}, [embedding]],
                        type: "password",
                        editMode: true
                    },
                    display: {
                        text: {
                            fontSize: 14,
                            fontWeight: 300,
                            textAlign: "left"
                        }
                    },
                    position: {
                        bottom: 85,
                        left: 200,
                        height: 20,
                        width: 200
                    }
                }
            },
            loginButton: {
                description: {
                    "class": o(
                        { name: "UnderlinedTextLabel20Px", text: "LOGIN", background: "#3939E6" },
                        "ShowHelpToolTip"
                    ),
                    context: {
                        helpToolTipText: "Log in with your email and password",
                        extHelpToolTipSrc: "helpTexts/login.html"
                    },
                    position: {
                        bottom: 20,
                        left: 145,
                        height: 30,
                        width: 70
                    },
                    write: {
                        onClick: {
                            upon: [or,
                                myClick,
                                [{type: "KeyPress", key: "Return", recipient: "global"}, [message]]
                            ], 
                            true: {
                                login: {
                                    to: [loginInfo],
                                    merge: {
                                        username: [{email: _}, [embedding]],
                                        password: [{password: _}, [embedding]]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skipButton: {
                description: {
                    "class": o(
                        { name: "UnderlinedTextLabel20Px", text: "SKIP", background: "#E63939" }
                    ),
                    write: {
                        onClick: {
                            upon: [or,
                                myClick,
                                [{type: "KeyDown", key: "Esc", recipient: "global"}, [message]]
                            ], 
                            true: {
                                cancelLogin: {
                                    to: [{showLoginScreen: _}, [myContext, "App"]],
                                    merge: false
                                }
                            }
                        }
                    },
                    position: {
                        bottom: 20,
                        right: 145,
                        height: 30,
                        width: 70
                    }
                }
            }
        }
    },

    SignUpScreen: {
        "class": "FocusRingContext",
        context: {
            "*password": o(),
            "*email": o(),
            focusAreas: o(
                [{children: {emailInput: _}}, [me]],
                [{children: {passWordInput: _}}, [me]]
            )
        },
        display: {
            borderRadius: 0
        },
        position: {
            width: 500,
            height: 200
        },
        children: {
            text1: {
                description: {
                    "class": { name: "TextLabel14Px", text: "Create a user account" },
                    position: {
                        top: 5,
                        left: 5,
                        height: 20,
                        width: [displayWidth]
                    }
                }
            },
            text2: {
                description: {
                    "class": o(
                        { name: "UnderlinedTextLabel14Px", text: "or login" },
                        { name: "FlipButton", value: [{createAccount: _}, [myContext, "App"]] }
                    ),
                    position: {
                        "class": { name: "RightOfSibling", sibling: "text1", distance: 3 },
                        top: 5,
                        height: 20,
                        right: 0
                    }
                }
            },
            errorMsg: {
                description: {
                    display: {
                        text: {
                            "class": "Font",
                            fontSize: 14,
                            fontWeight: 400,
                            color: "red",
                            textAlign: "left",
                            value: [
                                translateError,
                                [{loginStatus: _}, [tempAppStateConnectionInfo]]
                            ]
                        }
                    },
                    position: {
                        "class": { name: "BelowSibling", sibling: "text1", distance: 0 },
                        left: 5,
                        height: 20,
                        right: 0
                    }
                }
            },
            emailLabel: {
                description: {
                    "class": { name: "TextLabel14Px", text: "email" },
                    position: {
                        top: 60,
                        left: 60,
                        height: 20,
                        width: 80
                    }
                }
            },
            emailInput: {
                description: {
                    "class": o("TextValueInput", "FocusRing"),
                    context: {
                        value: [{email: _}, [embedding]],
                        type: "text",
                        editMode: true
                    },
                    display: {
                        text: {
                            fontSize: 14,
                            fontWeight: 300,
                            textAlign: "left"
                        }
                    },
                    position: {
                        top: 60,
                        left: 200,
                        height: 20,
                        width: 200
                    }
                }
            },
            passWordLabel: {
                description: {
                    "class": { name: "TextLabel14Px", text: "password" },
                    position: {
                        top: 90,
                        left: 60,
                        height: 20,
                        width: 80
                    }
                }
            },
            passWordInput: {
                description: {
                    "class": o("TextValueInput", "FocusRing"),
                    context: {
                        value: [{password: _}, [embedding]],
                        type: "password",
                        editMode: true
                    },
                    display: {
                        text: {
                            fontSize: 14,
                            fontWeight: 300,
                            textAlign: "left"
                        }
                    },
                    position: {
                        top: 90,
                        left: 200,
                        height: 20,
                        width: 200
                    }
                }
            },
            createButton: {
                description: {
                    "class": { name: "UnderlinedTextLabel20Px", text: "CREATE", background: "#3939E6" },
                    position: {
                        bottom: 20,
                        left: 145,
                        height: 30,
                        width: 70
                    },
                    write: {
                        onClick: {
                            upon: [or,
                                myClick,
                                [{type: "KeyPress", key: "Return", recipient: "global"}, [message]]
                            ], 
                            true: {
                                create: {
                                    to: [loginInfo, {createAccount: true}],
                                    merge: {
                                        username: [{email: _}, [embedding]],
                                        password: [{password: _}, [embedding]],
                                        email: [{email: _}, [embedding]]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skipButton: {
                description: {
                    "class": o(
                        { name: "UnderlinedTextLabel20Px", text: "CANCEL", background: "#E63939" }
                    ),
                    write: {
                        onClick: {
                            upon: [or,
                                myClick,
                                [{type: "KeyDown", key: "Esc", recipient: "global"}, [message]]
                            ], 
                            true: {
                                cancelLogin: {
                                    to: [{showLoginScreen: _}, [myContext, "App"]],
                                    merge: false
                                },
                                cancelCreateAccount: {
                                    to: [{createAccount: _}, [myContext, "App"]],
                                    merge: false
                                }
                            }
                        }
                    },
                    position: {
                        bottom: 20,
                        right: 145,
                        height: 30,
                        width: 70
                    }
                }
            }
        }
    },
    
    LogoutScreen: {
        display: {
            borderRadius: 0
        },
        position: {
            width: 500,
            height: 200
        },
        children: {
            logoutButton: {
                description: {
                    "class": { name: "UnderlinedTextLabel20Px", text: "LOGOUT", background: "#3939E6" },
                    position: {
                        bottom: 20,
                        left: 0,
                        height: 30,
                        right: 0
                    },
                    write: {
                        onClick: {
                            upon: [or,
                                myClick,
                                [{type: "KeyPress", key: "Return", recipient: "global"}, [message]]
                            ], 
                            true: {
                                create: {
                                    to: [loginInfo],
                                    merge: o()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
