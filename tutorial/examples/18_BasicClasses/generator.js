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


// %%include%%: "reference.js"

// This file implements a set of classes which provide for generating unique
// objects in a application. A unique object is, essentially, an object
// which is placed in some writeable list and contains a unique ID under its
// 'id' field. Whether the object contains additional information and how
// thi information is interpreted is up to the application to defined.
//
// There is a single global 'next ID' generator. Each time a new unique object
// is generated, the 'next ID' is used as the ID of a new object pushed 
// onto the relevant list of objects. The 'next ID' is then increased so
// that the next time an object is created, it will receive a new ID.
// Since the 'next ID' only changes at the end of a write step, multiple
// write operations triggered simultaneously by the same write clause will
// all use the same 'next ID'. One should therefore never create multiple
// objects (which are not allowed to have the same ID) in the same write
// step. At the same time, this makes it easy to create an object and
// immediately add the same object to various lists (e.g. create an object
// and immediately add it to the list of objects 'on viewed' or 'being
// edited'.
//

var classes = {

    // Counter for unique ids; don't use twice in the same write cycle
    NextIdContext: {
        context: {
            "^nextId": 1025
        }
    },

    /// Add to a write clause to increment the global nextId
    IncrementNextId: {
        incrementNextId: {
            to: [{ nextId: _ }, [myContext, "NextId"]],
            merge: [plus, [{ nextId: _ }, [myContext, "NextId"]], 1]
        }
    },

    // This is a base class which can be use to create a object which is
    // a manager for a set of object of some kind. When this object receives
    // a message (with the area as the recipient), it pushes a new object
    // with the current global 'next ID' to its list of objects. The code
    // below pushes the object { id: <next ID> } onto the writeable
    // ordered set 'uniqueObjects', but this can be modified by a derived class.
    // To add an object to this object manager, one should send a message
    // {
    //     message: "Add",
    //     recipient: <this object manager>
    // }
    
    ObjectManager: o({
        context: {
            // default place to write the objects to. 
            "^uniqueObjects": o(),
        },

        // override parts of this write statement to modify the creation of
        // new objects.
        
        write: {
            onAddUniqueObject: {
                upon: [{ message: "Add" }, [myMessage]],
                true: {
                    // increment unique ID (after adding the object)
                    "class": "IncrementNextId",
                    addUniqueObject: {
                        to: [{ uniqueObjects: _ }, [me]],
                        merge: push({
                            // unique ID of this object
                            id: [{ nextId: _ }, [myContext, "NextId"]],
                        })
                    },
                }
            }
        },
    })    
};
