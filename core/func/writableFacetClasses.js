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
// This library offers the writable facet functionality: a facet whose *cell* values are writable.
/////////////////////////////////////////////////////////////////////////////////////////////////////////

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents a writable facet whose cells can be simple text. One example: a comment facet.
    // It inherits WritableFacet.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableTextFacet: {
        "class": "WritableFacet"
    },
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the class to be inherited by a cell of a WritableTextFacet.
    // It inherits:
    // 1. WritableCell: the class to be inherited by any cell whose value we'd like to be able to write to.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableTextCell: {
        "class": "WritableCell",
        context: {            
            editInputText: [{ writeMode:_ }, [me]]    // override default appData. instead, use as a writable ref that points to WritableCell's writeMode.
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nothing doing for now.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableFacet: {
    },
                        

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class is inherited by the Cells in a WritableFacet.
    // It maintains a writeMode appData. When writeMode: true, values can be written to this cell's content.
    // When we're in writeMode: true, a mouseDown 'elsewhere' (the definition of 'elsewhere' varies depending on whether this is a symbol- or text-based ratingFacet) switches off the
    // write mode. 
    // In the absence of a join operation (and in particular for appData), this class also handles the pushing of an object, myItemObjInWritableItemDB, into the writableItemDB.
    // It does so if one does not exist there already, and on the first time writeMode: true.
    // This is an object of the form { symbol: "MMM", myRating: "notDefined" }.
    //
    // API: 
    // 1. immunityFromTurningWriteModeOff: an os of areaRef who can receive a mouseDown without triggering writeMode: false. The default definition is this cell and its embeddedStar.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    WritableCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                "^writeMode": false,
                // before writing to one of the cells pertaining to this cell's item, it will not (yet) be represented in the writable itemDB.
                myItemObjInWritableItemDB: [ // select the object describing my solutionSetItem from the writableItemDB. 
                                            [{ myItemUniqueIDAVP:_ }, [me]],
                                            [{ myApp: { writableItemDB:_ } }, [me]]
                                           ],
                // and when the itemObj does already exist in the writable itemDB, it still may not (yet) have the attribute pertaining to this cell's facet 
                myAttrInMyItemObjInWritableItemDB: [
                                                    [{ myFacet: { facetProjectionQuery:_ } }, [me]],
                                                    [{ myItemObjInWritableItemDB:_ }, [me]]
                                                   ]                                                 
            }
        },
        { // default
            "class": "TextInput",
            context: {                
                myItemUniqueIDAVP: [{ mySolutionSetItem: { itemUniqueIDSelectionQuery:_ } }, [me]], // something of the form { symbol: "MMM" }
                immunityFromTurningWriteModeOff: o(
                                                   [me], 
                                                   [embeddedStar, [me]]
                                                  )
            }           
        },
        // this 'initialization' of the writableItemDB with an AVP representing the value for this cell's item/writableFacet is needed till the platform supports join operations.
        // once it does, the cdl can assume the writable address exists - the platform will either write to it, or create it and then write to it, as the case may be.
        {
            qualifier: { myItemObjInWritableItemDB: false },
            write: {        
                onWritableCellDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: { 
                        pushAVPToWritableItemDB: {
                            to: [{ myApp: { writableItemDB:_ } }, [me]],
                            merge: push([merge,                             // merging of two objects:
                                         [{ myItemUniqueIDAVP:_ }, [me]],   // an object of the form { symbol: "MMM" }
                                         [                                  // an object of the form { myRating: "notDefined" }
                                          [{ myFacet: { facetQuery:_ } }, [me]], 
                                          "notDefined"
                                         ]
                                        ])
                        }
                    }
                }
            }
        },
        {
            qualifier: { myItemObjInWritableItemDB: true,
                         myAttrInMyItemObjInWritableItemDB: false },
            write: {        
                onWritableCellDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: { 
                        addAVPToWritableItemDB: {
                            to: [{ myItemObjInWritableItemDB:_ }, [me]],
                            merge: [merge, // merging the preexisting itemObj in the writable itemDB with the new attribute to be added
                                    [ // an object of the form { myRating: "notDefined" } - this is the attr the object in the writable itemDB is missing!
                                     [{ myFacet: { facetQuery:_ } }, [me]], 
                                     "notDefined"
                                    ],
                                    [{ myItemObjInWritableItemDB:_ }, [me]]
                                   ]
                            /* uncomment this, and remove merge: above once bug #710 is solved.
                            merge: [ // an object of the form { myRating: "notDefined" } - this is the attr the object in the writable itemDB is missing!
                                    [{ myFacet: { facetQuery:_ } }, [me]], 
                                    "notDefined"
                                   ]
                            */
                        }
                    }
                }
            }
        },
        {
            qualifier: { writeMode: false },                     
            write: {
                onWritableCellMouseDoubleClick: {
                    "class": "OnMouseDoubleClick",
                    true: {
                        writeModeOn: {
                            to: [{ writeMode:_ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { writeMode: true },
            "class": "BlockMouseEvent", // when in writeMode: true, we don't want mouse events to propagate to the areas below the cell being edited.
            write: {
                onRatingCellMouseDownElsewhere: {
                    upon: [mouseDownNotHandledBy,
                           [{ immunityFromTurningWriteModeOff:_ }, [me]]
                          ],
                    true: {
                        writeModeOff: {
                            to: [{ writeMode:_ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    ),
        
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is a class inherited by areas embedded in a WritableCell, which wish to access its context data, and define variants based on its state.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    TrackMyWritableCell: o(
        { // variant-controller
            qualifier: "!",
            context: {
                writeMode: [{ myWritableCell: { writeMode:_ } }, [me]],
                writableCellValueDefined: [and,
                                           [{ myWritableCell: { myItemObjInWritableItemDB:_ } }, [me]],
                                           [notEqual,
                                            [{ myWritableCell: { content:_ } }, [me]],
                                            "notDefined"
                                           ]
                                          ]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                myWritableCell: [
                                 [embeddingStar, [me]],
                                 [areaOfClass, "WritableCell"]
                                ]
            }
        }
    )
};