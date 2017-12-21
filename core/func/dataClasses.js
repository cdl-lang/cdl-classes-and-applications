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
    // API:
    // 1. myFileInputHotspot
    // 2. positioning
    // 4. fileInputDefaultDisplayText: a boolean, true by default. If false, inheriting class should handle displayText.
    //    (see EffectiveBaseName's inheritance of FileInputController)
    // 4.1. noFileObjSelectedText: default provided
    // 4.2. fileObjSelectedText: default provided`
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FileInputController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                fileInputDefaultDisplayText: true
            }
        }, 
        { // default
            "class": o("GeneralArea", "FileInputControllerDesign"),
            context: {
                noFileObjSelectedText: "Click to Select File, or Drop File Here",
                fileObjSelectedText: [{ fileObjSelected: { baseName:_ } }, [me]],
                "*fileObjSelected": o()
            }
        },
        {
            qualifier: { fileInputDefaultDisplayText: true },
            context: {
                displayText: [cond,
                              [{ fileObjSelected:_ }, [me]],
                              o({ on: false, use: [{ noFileObjSelectedText:_ }, [me]] },
                                { on: true, use: [{ fileObjSelectedText:_ }, [me]] }
                               )
                             ]
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Important note: this class should not be inherited by an area that would like to make other use
    // of the display.text object, such as displaying text.value there. So the standard solution would be to have this class embedded in an area
    // that is as big as its embedding (frame: 0)
    // API: 
    // 1. positioning
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FileInputHotspot: o(
        { // variant-controller
            qualifier: "!",
            context: {
                fileDraggedOverMe: [{ param: { dragInArea:_ } }, [me]]
            }
        },
        {
            "class": o("GeneralArea", "AboveSiblings"),
            context: {
                myFileInputController: [
                    { myFileInputHotspot: [me] },
                    [areaOfClass, "FileInputController"]
                ]
            },
            display: {
                opacity: 0, // see comment in class documentation
                text: {
                    input: {
                        type: "file",                         
                        acceptFiles: o(".csv", ".json", ".txt", ".tsv")
                    }
                }
            },
            write: {
                onFileInputHotSpotFileChoice: {
                    upon: [{ type: "FileChoice"}, [myMessage]], // note: this includes both subTypes: "pick" (selection via a dialog box), and "drop" (dropping a file on the area)
                    true: {
                        recordFileObjSelected: {
                            to: [{ myFileInputController: { fileObjSelected:_ } }, [me]],
                            merge: [{files:_ }, [message]]
                        }
                    }
                }
            }
        }
    ),
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API:
    // 1. myFileInputHotspot
    // 2. Inheriting class should ensure this area appears over relevant areas, to give them an semi-opaque
    //    appearance, yet keep it z-lower than the FileInputHotspot, as the latter needs to be z-highest.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FileDraggedOverAppIndicator: o(
        { // variant-controller
            qualifier: "!",
            context: {
                fileDraggedOverHotspot: [{ myFileInputHotspot: { fileDraggedOverMe:_ } }, [me]]
            }
        },
        {
            "class": "Border",
            position: {
                frame: 0
            }
        },
        {
            qualifier: { fileDraggedOverHotspot: true },
            "class": "BackgroundColor",
            display: {
                opacity: 0.3
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    FileInputControllerDesign: o(
        {
            qualifier: { fileInputDefaultDisplayText: true },
            "class": "DefaultDisplayText"
        }
    )
};