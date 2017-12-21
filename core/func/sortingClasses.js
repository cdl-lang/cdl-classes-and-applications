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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// This library provides the sorting functionality
////////////////////////////////////////////////////////////////////////////////////////////////////////

// %%classfile%%: <sortingDesignClasses.js>

var sortingConstants = {
    numOfSortingLevels: 3
};

var classes = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class controls the sorting state for an os of Sortables, who have SorterUX areas associated with them.
    // The sorting state is sortingKey, an os of sort objects of the form { uniqueID: <sortingBy>, sort: <sortingDirection> }, which is used by the SortingController's cdl-defined
    // sort function. 
    // Note: this is a cdl work-around that allows to sort not only by attributes found in the item db, but also by os membership (e.g. sort by membership in the Favorites overlay).
    // If no sorting selection is made, default values are used. If a sorting selection is made, but isn't 'Showing' (see API; for example, we sort by a certain facet, and then hide it),
    // then once again the default values are used.
    //
    // API: 
    // 1. defaultSortableUniqueID: the sortableUniqueID for a class inheriting Sortable, whose mySortingController is this SortingController. 
    //    there should be exactly one Sortable with this defaultSortableUniqueID at all times.
    // 2. defaultSortingDirection: "ascending"/"descending". "ascending", by default.
    // 3. singleLayerSorting: boolean, false by default. Do we allow for multiple layers of sorting or not.
    //
    // To access the output of this class:
    // 1. sortingKey is the selection on the specifiedSortingKey of the objects pertaining to those Sortable for which sortableShowing: true.
    // 2. Its [{ sort:_ }, [me]] function, which takes an os of data as input, and uses its associated Sortables to calculate the multi-layer sorting.
    // 2. latestSortingSortableUniqueID / latestSortingDirection
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SortingController: o(
        { // variant-controller
            qualifier: "!",
            context: {
                // do these really need to be exported?
                latestSortingSortableUniqueID: [{ latestSortingKey: { uniqueID: _ } }, [me]],
                latestSortingDirection: [{ latestSortingKey: { sort: _ } }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                defaultSortingDirection: "ascending",

                defaultSortingKey: {
                    uniqueID: [{ defaultSortableUniqueID: _ }, [me]],
                    sort: [{ defaultSortingDirection: _ }, [me]]
                },

                singleLayerSorting: false,
                numOfSortingLevels: sortingConstants.numOfSortingLevels,

                mySorterUXs: [
                    { mySortingController: [me] },
                    [areaOfClass, "SorterUX"]
                ],
                mySortables: [
                    { mySortingController: [me] },
                    [areaOfClass, "Sortable"]
                ],
                mySortablesShowing: [
                    { sortableShowing: true },
                    [{ mySortables: _ }, [me]]
                ],

                sortBySpecifiedKeyEvenWhenNotShowing: false, // typically we don't want to sort by the key not showing. See DiscreteFacet for counter example
                "^specifiedSortingKey": [{ defaultSortingKey: _ }, [me]],
                uniqueIDForSortingKey: [cond,
                    [{ sortBySpecifiedKeyEvenWhenNotShowing: _ }, [me]],
                    o(
                        {
                            on: true,
                            use: [{ specifiedSortingKey: { uniqueID: _ } }, [me]]
                        },
                        {
                            on: false,
                            use: [
                                [{ mySortablesShowing: { sortableUniqueID: _ } }, [me]],
                                [{ specifiedSortingKey: { uniqueID: _ } }, [me]]
                            ]
                        }
                    )
                ],
                sortingKey: [cond,
                    [{ uniqueIDForSortingKey: _ }, [me]],
                    o(
                        {
                            on: false,
                            use: [{ defaultSortingKey: _ }, [me]]
                        },
                        {
                            on: true,
                            use: [
                                { uniqueID: [{ uniqueIDForSortingKey: _ }, [me]] },
                                [{ specifiedSortingKey: _ }, [me]]
                            ]
                        }
                    )
                ],
                latestSortingKey: [last, [{ sortingKey: _ }, [me]]],

                sortingKeysEarliestToLatest: [map,
                    [defun,
                        o("uniqueID"),
                        [
                            {
                                sortableUniqueID: "uniqueID",
                                sortKey: _
                            },
                            [{ mySortables: _ }, [me]]
                        ]
                    ],
                    [{ sortingKey: { uniqueID: _ } }, [me]]
                ],

                // note that the os of sorting functions has the earliest sorting function as its first element, and the latest sorting function as its last element.
                // this needs to be reversed for [sort]
                sortKeys: [reverse, [{ sortingKeysEarliestToLatest: _ }, [me]]]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class represents the entity that one can sort by (e.g. Facet). It provides a sorting function, which is a used if this sortable is representing in its sortingController's 
    // sortingKey. The os of these sortables then applies its sorting function, one after the other, to the data to be sorted.
    //
    // API:
    // 1. mySortingController: an areaRef to a class inheriting SortingController
    // 2. sortableUniqueID: a uniqueID (should be unique with respect to the set of Sortable areas which share a SortingController).
    // 3. a sort function
    // 4. sortableShowing: boolean, true by default. Inheriting class will want to override this.
    // 5. defaultSortingDirection: the direction that this sortable will sort by if it's clicked on when { sortingByMe: false }.
    //    default value is the sortingController's defaultSortingDirection.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    Sortable: o(
        { // variant-controller
            qualifier: "!",
            context: {
                sortingByMe: [{ currentSortingKey: _ }, [me]]
            }
        },
        { // default
            "class": "GeneralArea",
            context: {
                sortableShowing: true, // default

                defaultCurrentSortingKey: [
                    { uniqueID: [{ sortableUniqueID: _ }, [me]] },
                    [{ mySortingController: { sortingKey: _ } }, [me]]
                ],
                currentSortingKey: [{ defaultCurrentSortingKey: _ }, [me]],
                defaultNextSortingKey: { // the default - see variant of OverlayMeasurePairInFacet where we refine the definition of nextSortingKey
                    uniqueID: [{ sortableUniqueID: _ }, [me]],
                    sort: [{ nextSortingDirection: _ }, [me]]
                },
                nextSortingKey: [{ defaultNextSortingKey: _ }, [me]],
                mySorterUX: [
                    { mySortable: [me] },
                    [areaOfClass, "SorterUX"]
                ],
                defaultSortingDirection: [{ mySortingController: { defaultSortingDirection: _ } }, [me]]
            }
        },
        {
            qualifier: { sortingByMe: false },
            context: {
                nextSortingDirection: [{ defaultSortingDirection: _ }, [me]]
            }
        },
        {
            qualifier: { sortingByMe: true },
            context: {
                // note sorting level's definition: in an array of three sort keys, the latest sorting key is the last object in the controller's sortingKey.
                //  it has a sortingLevel of 1, and an index in the array of 2. the oldest sortingKey has a sortingLevel of 3, and an index of 0.
                // the first
                sortingLevel: [minus,
                    [size, [{ mySortingController: { sortingKey: _ } }, [me]]],
                    [index,
                        [{ mySortingController: { sortingKey: _ } }, [me]],
                        [{ currentSortingKey: _ }, [me]]
                    ]
                ],

                sortingDirection: [{ currentSortingKey: { sort: _ } }, [me]],
                nextSortingDirection: [cond,
                    [{ sortingDirection: _ }, [me]],
                    o(
                        { on: "ascending", use: "descending" },
                        { on: "descending", use: "ascending" }
                    )
                ]
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // This class provides the UX for changing sorting.
    // 
    // API:
    // 1. mySortable: an areaRef to a class inheriting Sortable.
    // 2. sortingEvent: mouseClickEvent, by default    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SorterUX: o(
        { // variant-controller
            qualifier: "!",
            context: {
                singleLayerSorting: [{ mySortingController: { singleLayerSorting: _ } }, [me]]
            }
        },
        { // default
            "class": o("TooltipableControl", "Tmdable"),
            context: {
                mySortingController: [{ mySortable: { mySortingController: _ } }, [me]],

                // Tooltipable params
                tooltipText: [{ myApp: { sortStr: _ } }, [me]],
                defaultSortingEvent: [and,
                    [{ tmd:_ }, [me]],
                    mouseClickEvent
                ],
                sortingEvent: [{ defaultSortingEvent:_ }, [me]]
            },
            propagatePointerInArea: o(), // this doesn't prevent the OverlayLegend tooltip from appearing under the sorting arrow's tooltip (#1334)
            write: {
                onSorterUXSortingEvent: {
                    upon: [{ sortingEvent: _ }, [me]]
                    // true: see variants below, and inheriting classes
                }
            }
        },
        {
            qualifier: { singleLayerSorting: false },
            context: {
                // first, we observe the specifiedSortingKey minus the current key - this is to avoid having the specified sorting key store multiple sorts on the same key
                // (e.g. o({ uniqueID: "price", sort: "ascending}, { uniqueID: "weight", sort: "ascending}, { uniqueID: "price", sort: "descending}) - this should instead be 
                // recorded as o({ uniqueID: "weight", sort: "ascending}, { uniqueID: "price", sort: "descending})
                // if the specifiedSortingKeyMinusCurrentKey is not yet full (i.e. doesn't yet have numOfSortingLevels elements), then it should be used as the prefix of the new specified 
                // sorting key. if it is already full, then its oldest element, the first in it, should be dropped.
                // in either case, the latest sorting (nextSortingKey) is appended at the end of this os.
                specifiedSortingKeyMinusCurrentKey: [ // remove from specifiedSortingKey the currentSortingKey of mySortable, to the extent it is there. if not there, no harm done.
                    n([{ mySortable: { currentSortingKey: _ } }, [me]]),
                    [{ mySortingController: { specifiedSortingKey: _ } }, [me]]
                ],
                prefixOfNewSpecifiedSortingKey: [cond,
                    [lessThan,
                        [size, [{ specifiedSortingKeyMinusCurrentKey: _ }, [me]]],
                        [{ mySortingController: { numOfSortingLevels: _ } }, [me]]
                    ],
                    o(
                        {
                            on: true,
                            use: [{ specifiedSortingKeyMinusCurrentKey: _ }, [me]]
                        },
                        {
                            on: false,
                            use: [pos, // take the last numOfSortingLevels-1 elements (index 1 through (numOfSortingLevels-1))
                                r(1, [minus, [{ mySortingController: { numOfSortingLevels: _ } }, [me]], 1]),
                                [{ specifiedSortingKeyMinusCurrentKey: _ }, [me]]
                            ]
                        }
                    )
                ]
            },
            write: {
                onSorterUXSortingEvent: {
                    true: {
                        addToSortingKey: {
                            to: [{ mySortingController: { specifiedSortingKey: _ } }, [me]],
                            merge: o(
                                [{ prefixOfNewSpecifiedSortingKey: _ }, [me]],
                                // add the nextSortingKey of mySortable as the last element in specifiedSortingKey.
                                // it is the latest sorting because of the way multiQuery works: when it receives [multiQuery, o(f1, fn), <data>] it calculates:
                                // [fn, [...[f1, <data>]]], so the last element - fn - will the last to be applied by multiQuery. if fn is a sorting function, it will be the
                                // highest level sorting applied to the data.
                                [{ mySortable: { nextSortingKey: _ } }, [me]]
                            )
                        }
                    }
                }
            }
        },
        {
            qualifier: { singleLayerSorting: true },
            write: {
                onSorterUXSortingEvent: {
                    true: {
                        setSpecifiedSortingKey: { // write a new specifiedSortingKey
                            to: [{ mySortingController: { specifiedSortingKey: _ } }, [me]],
                            merge: atomic([{ mySortable: { nextSortingKey: _ } }, [me]])
                        }
                    }
                }
            }
        }
    ),

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // The visual indication of the SorterUX. 
    //
    // API:
    // 1. mySorterUX - the areaRef of the associated SorterUX. [me], by default.
    // 2. the *Design class - inheriting classes may inherit SorterUXDisplayDesign, or provide any other class instead.
    // 3. dimensions: width/height. default dimensions provided.
    // 4. positioning.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    SorterUXDisplay: o(
        { // variant-controller
            qualifier: "!",
            context: {
                sortingByMe: [{ mySortable: { sortingByMe: _ } }, [me]],
                sortingDirection: [{ mySortable: { sortingDirection: _ } }, [me]],
                sortingLevel: [{ mySortable: { sortingLevel: _ } }, [me]],
                numOfSortingLevels: [{ mySortable: { mySortingController: { numOfSortingLevels: _ } } }, [me]],
                indicateSelectability: [{ mySorterUX: { inFocus: _ } }, [me]]
            }
        },
        { // default
            context: {
                mySorterUX: [me],
                mySortable: [{ mySorterUX: { mySortable: _ } }, [me]]
            },
            position: { // will be made redundant once display queries are alive and well again
                width: generalPosConst.sorterUXDisplayWidth,
                height: generalPosConst.sorterUXDisplayHeight
            }
        }
    )
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // End of Sorting Classes
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////

};
