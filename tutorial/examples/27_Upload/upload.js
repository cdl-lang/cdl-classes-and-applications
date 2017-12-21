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

    /// An area that inherits this class will upload a file to the persistence
    /// server, adding the appropriate attributes.
    Uploader: {
        context: {
            uploadedFileHandle: [{files: {fileHandle: _}}, [message]],
            uploadedFileName: [{files: {name: _}}, [message]],
            uploadedFileTimeStamp: [{files: {lastModified: _}}, [message]],
            uploadedFileSize: [{files: {size: _}}, [message]],
            uploadedData: [datatable, [{ uploadedFileHandle: _ }, [me]]]
        },
        write: {
            onUpload: {
                upon: [{message: "Upload", recipient: "start"}, [message]],
                true: {
                    uploadFile: {
                        to: [databases],
                        merge: {
                            name: [{uploadedFileName: _}, [me]],
                            attributes: [{uploadedData: {attributes: _}}, [me]],
                            metaData: {
                                timestamp: [{uploadedFileTimeStamp: _}, [me]]
                            },
                            data: [getRawData, [{uploadedData: _}, [me]]],
                            nrRecords: [size, [{uploadedData: {data: _}}, [me]]],
                            fileSize: [{uploadedFileSize: _}, [me]]
                        }
                    }
                }
            }
        }
    },

    /// This class adds a browser upload button to your area. It adds an
    /// embedded invisible area that covers the whole parent; this is needed
    /// because a file input element shows its own button and text. Like this,
    /// it won't be visible, but still take the click.
    UploadFileButton: {
        children: {
            actualButton: {
                description: {
                    "class": "UploadFileReceiver",
                    display: {
                        opacity: 0,
                        "text.input.type": "file"
                    },
                    position: {
                        frame: 0
                    }
                }
            }
        }
    },

    /// This class sends a file list to the Uploader class. Add this to the area
    /// that should receive a dropped file.
    UploadFileReceiver: {
        write: {
            upload: {
                upon: [{type: "FileChoice"}, [myMessage]],
                true: {
                    sendUploadMessage: {
                        to: [message],
                        merge: {
                            message: "Upload",
                            files: [{files: _}, [myMessage]]
                        }
                    }
                }
            }
        }
    }
};
