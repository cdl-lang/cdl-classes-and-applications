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

    // inheriting this class creates a button such that clicking on the
    // button opens the browser's file upload dialog.
    // This class does not process the FileChoice event. However,
    // this class does provide the write clause for processing
    // the FileChoice event when a file is selected through the browser
    // dialog window opened as a result of clicking on this area
    // (this is because the event is generated in the 'theSelector'
    // child of this class, but is processed in the area of this class
    // itself.
    
    FileSelector: o(
        {
            context: {
                // default
                acceptedFiles: o(".csv", ".json", ".txt", ".tsv"),
                // check whether this is true to detect a file pick event
                // at this area
                filePickEvent: [{ type: "FileChoice", subType: "pick" },
                                [{ recipient:
                                   [{ children: { theSelector: _ }}, [me]]
                                 },
                                 [message]]]
            },
            children: {
                theSelector: {
                    description: {
                        position: { frame: 0 },
                        display: {
                            opacity: 0,
                            text: {
                                input: {
                                    type: "file",                         
                                    acceptFiles: [{ acceptedFiles: _ },
                                                  [embedding]]
                                }
                            }
                        },
                    }
                }
            }
        }
    ),

    FileChoice: o(
        {
            context: {
                // should a file choice replace the existing one or add
                // to it?
                replaceFiles: false,
                "^selectedFiles": o(),

                allowDrag: true,
                // true when a file is dropped on this area and dropping
                // of files is allowed
                fileDragEvent: [and, [{ allowDrag: true }, [me]],
                                [{ type: "FileChoice",  subType: "drop" },
                                [myMessage]]]
            },
            write: {
                fileChoice: {
                    upon: [o({ fileDragEvent: true }, { filePickEvent: true }),
                           [me]],
                    true: {
                        recordFiles: {
                            to: [{ selectedFiles: _ }, [me]],
                            // default behavior: selected files are added
                            // to the eisting list
                            merge: push([{files:_ }, [message]])
                        }
                    }
                }
            }
        },
        {
            qualifier: { replaceFiles: true },
            write: {
                fileChoice: {
                    true: {
                        recordFiles: {
                            // selected files replace the previously selected
                            // files
                            merge: [{files:_ }, [message]]
                        }
                    }
                }
            }
        }
    )
};
