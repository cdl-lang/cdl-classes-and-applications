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


// %%include%%: "../18_BasicClasses/reference.js"

/*
Hierarchy:
- TopLevelSelectionChain (of class SingleLevelSelectionChain)
    - FacetDataSelector
        - ImplicitSolutionSet
    - FacetDataSelectorInnerLevel 
        - SecondLevelSelectionChain
*/


var classes = {

    // This class should be included in one of the embedding* areas of the
    // selection chain area. It provides the input to the selection
    // chain, such as the data on which selection takes place.
    
    SelectionChainContext: o(
        {
            context: {
                inputData: mustBeDefined,
                // optional:
                // facetTranslations: ?
            }
        },
        {
            qualifier: { facetTranslations: true },
            
            // facet translation areas are generated once per selection
            // chain content, as they only perform the translation and
            // o not store any selection-chain specific information.
            children: {
                // create an area to support the translation for this facet
                // (the assumption is that there are not many of these).
                facetTranslations: {
                    // user side name of translated facets. 
                    data: [{ userFacet: _ }, [{ facetTranslations: _ }, [me]]],
                    description: {
                        "class": "FacetTranslation"
                    }
                },
                // create an area to support the translation for the sub-facets
                // of a compound facet. The areas supporting the translation of
                // each sub-facet are children of these areas.
                subFacetTranslations: {
                    data: [{ primaryFacet: true },
                           [{ facetTranslations: _ }, [me]]],
                    description: {
                        "class": "CompoundFacetTranslation",
                    }
                }
            }
        }
    ),

    // This is the main class which should be used to create a selection
    // chain. It supports both simple facets, selecting on a path of length 1,
    // such as { x: <values> }, and compound facets, selecting on a lower
    // ordered set inside each entry, such as { x: { y: <values> }} where
    // entries under field 'x' can be ordered sets.
    //
    // This class has to have an embedding* area of class SelectionChainContext,
    // which provides its input data.
    // 
    // Selections made should be written to the 'selectedValues' ordered set
    // of this top level selection chain.
    //
    // For simple facets, the entries in this set are of the form:
    // {
    //     facetName: <name of facet>,
    //     value: <value selected>
    //     selected: true|false
    // }
    // If 'selected' is true, this adds a selection
    // { <facetName>: <value> } to the selection chain.
    //
    // For compound facets, the entries are of the form:
    // {
    //     facetName: <name of compound facet>,
    //     subFacets: o(
    //           {
    //               facetName: <name of sub-facet>,
    //               value: <value selected>
    //               selected: true|false
    //           }
    //           .....
    //     )
    // }
    // If 'selected' is true, this adds a selection
    // { <compound facet name>: { <sub facet name>: <value> }}
    // and a selection
    // { <sub facet name>: <value> } onto the chain applied after
    // the projection { <compound facet name>: _ }
    //
    // The selections performed by the selection chain depend on the
    // entries with 'selected' true which appear in the selectedValues array.
    // However, there exists an additional mechanism to de-activate
    // the selection on certain facets without removing the selections
    // stored for them, by defining the following lists in this area:
    //
    // activeFacetNames: o(<list of simple facet names>)
    // activeCompoundFacetNames: o(<list of compound facet names>)
    //
    // Alternatively, the active facets can be restricted by specifying
    // the inactive facets, as follows:
    //
    // inactiveFacetNames: o(<list of simple facet names>)
    // inactiveCompoundFacetNames: o(<list of compound facet names>)
    //
    // If both active and inactive facet names are specified, only facets
    // which appear in the active list but do not appear in the non-active
    // list are active.
    //
    // When any of these lists is defined and not empty, only the
    // simple/compound facets specified in the list participate in the
    // selection (but selections made in the non-active facets are stored
    // so when re-activating the facet the old selections are restored).
    //
    // Since an empty list makes all facets active, one should use a dummy
    // facet name (e.g. o("sdfsdfsdfs")) if one wants to be able to de-active
    // all facets.
    //
    
    // Output:
    //
    // The output of the selection chain consists of various solution sets.
    // 1. Top solution set:
    //    This is provided by the projection:
    //    [{ solutionSet: _ }, <selection chain area>]
    //    This returns the result of applying all the active queries
    //    (simple and compound) to the input data. The selection is only
    //    on the top level data, so compound selections are of the form
    //    { x: { y: <values> }} returning all top level items which have at
    //    least one sub-item under 'x' which is matched by { y: <values> }.
    // 2. Top implicit solution set:
    //    This is provided bt the function call:
    //    [
    //       [{ getImplicitSolutionSet: _ }, <selection chain area>],
    //       <facet name>
    //    ]
    //    It returns te result of applying the queries of all facets
    //    except that given by <facet name> to the top level data
    //    (that is, as above, compound selections select using
    //    { x: { y: <values> }}.
    // 3. Projected solution set:
    //    This is provided by the function call:
    //    [
    //       [{ getProjectedSolutionSet: _ }, <selection chain area>],
    //       <facet name>
    //    ]
    //    This returns the solution set projected on the given facet.
    //    If the given facet is a compound facet and has selections
    //    in its sub-facets, this returns oly those sub-items which were
    //    matched by the sub-facets (so this is the result of
    //    [{ y: <values> }, [{ x: _ }, <data>]] rather than
    //    [{ x: { y: <values> }}, <data>] which is what is returned
    //    by { solutionSet: _ } above.
    // 4. Sub-facet implicit solution set:
    //    This is provided by the function call:
    //    [
    //       [{ getSubFacetImplicitSolutionSet: _ }, <selection chain area>],
    //       <main facet name>, <sub-facet name>
    //    ]
    //    This returns the solution set projected on <main facet name>
    //    resulting from applying all facets except for the given sub-facet
    //    inside the compound facet <main facet name>.

    // Translation:
    //
    // Sometimes, the path and values by which the selection is actually
    // performed (in the selecion chain) differ from those specified
    // in the 'selectedValues' list. This may happen, for example, when
    // the database does not contain the values on which the user would
    // naturally want to select but there is a translation between those
    // values and values which are in the database. In this case, the
    // selectedValues object stores the selection values as specified
    // by the user (so that if the mapping changes, the selection will still
    // continue to be performed the way the user specified it). Such a
    // translation can be specified for a simple facet or a simple sub-facet
    // of a compound facet (but not on the compound facet as a whole).
    //
    // The translation is specified by a translation table defined in the
    // selection chain context [myContext, "SelectionChain"]. The translation
    // is specified there as follows:
    // {
    //     facetTranslations: o(
    //         {
    //             userFacet: <name of facet as see by user>,
    //             dataFacet: <name of the facet in the database>,
    //             translation: o(
    //                 {
    //                     <userFacet>: o(<user facet values>),
    //                     <dataFacet>: o(<data facet values>)
    //                 }
    //                 .....
    //             )
    //         }
    //         .....
    //         {
    //             primaryFacet: <compound facet name>,
    //             facetTranslations: o(
    //                  <same strcture as above, but for sub-facets of this
    //                   compound facet>
    //             )
    //         }
    //     )
    // }
    //
    // Since the selection values written to 'selectedValues' are those
    // specified by the user, the selection chain needs to convert the
    // query before applying it, based on the given facet translation.
    // In addition, the selection chain provides a projection function
    // for getting the user facet values from any solution set in the
    // selection chain. This projection function can be used for any facet,
    // but for the translated facets this projection also performs the
    // translation.
    //
    // The 'translation' table is optional. If it is missing, the translation
    // will only translate the facet names but not the values (this can be
    // used, for example, when several virtual facets are actually defined
    // on a single field).
    
    TopLevelSelectionChain: o(
        {
            "class": "SingleLevelSelectionChain",
            context: {
                // each element should have { facetName: "x",
                //                            selected: true|false,
                //                            value: "y"}
                "^selectedValues": o(),

                // Access to the translation areas, if any
                facetTranslations: [{ children: { facetTranslations: _ }},
                                    [myContext, "SelectionChain"]],
                // Access to the compound facet translation areas, if any
                subFacetTranslations: [{ children: { subFacetTranslations: _ }},
                                       [myContext, "SelectionChain"]],
                
                // returns the list of names of compound facets which
                // have some selections defined for them.
                selectedCompoundFacetNames: [
                    _,
                    [{
                        facetName: _, 
                        subFacets: { selected: true } 
                    },
                     [{ selectedValues: _ }, [me]]]
                ],

                // compound facet names which have selections defined and are no
                // explicitly marked as inactive (by default, all compound
                // facets)
                notInactiveSelectedCompoundFacetNames: [
                    { selectedCompoundFacetNames: _ }, [me]],
                
                // the list of compound facet names which have selections
                // defined in them and are active (by default, all those which
                // have a selection, but this may be restricted (see variant
                // below).
                activeSelectedCompoundFacetNames: [
                    { notInactiveSelectedCompoundFacetNames: _ }, [me]],

                // the last facet is the last compound facet, if any,
                // and otherwise the last simple facet
                lastFacet: [
                    last,
                    o([{ lastSimpleFacet: _ }, [me]],
                      [{ children: { compoundFacetDataSelector: _ } }, [me]])
                ],
                
                // Get the projected implicit solution set for the given facet
                // and sub-facet (to be used inside compound facets)
                getSubFacetImplicitSolutionSet: [
                    defun, o("primaryFacetName", "subFacetName"),
                    [[first,
                      o(
                          // If there is a sub-selection-chain for the primary
                          // facet, use the implicit solution set as defined
                          // inside that sub-selection-chain.
                          [{ getImplicitSolutionSet: _ },
                           [{ primaryFacetName: "primaryFacetName" },
                            [{ children: { subSelectionChains: _ }}, [me]]]],
                          // Otherwise, simply project the solution set of the
                          // primary facet.
                          [defun, o("x"), // unused argument
                           [{ "#primaryFacetName": _ },
                            [{ solutionSet: _ }, [{ lastFacet: _ }, [me]]]]]
                      )],
                     "subFacetName"]],

                // get the projected solution set of a compound facet:
                // the subset of projected item matches by the query.
                // This is the solution set of the sub-selection-chain
                // for this facet if it exists and a projection on the
                // solution set of the top level selection chain otherwise.
                getProjectedSolutionSet: [
                    defun, o("primaryFacetName"),
                    // apply the first of two possible functions
                    [cond,
                     [{ primaryFacetName: "primaryFacetName" },
                      [{ children: { subSelectionChains: _ }}, [me]]],
                     o({
                         on: true,
                         use: [{ solutionSet: _ },
                               [{ primaryFacetName: "primaryFacetName" },
                                [{ children: { subSelectionChains: _ }}, [me]]]]
                     },
                       {
                           on: false,
                           use: [{ "#primaryFacetName": _ },
                                 [{ solutionSet: _ },
                                  [{ lastFacet: _ }, [me]]]] 
                       })
                    ]
                ]
            },
            
            children: {
                compoundFacetDataSelector: {
                    data: [{ activeSelectedCompoundFacetNames: _ }, [me]],
                    description: {
                        "class": "FacetDataSelectorInnerLevel"
                    }
                },
                subSelectionChains: {
                    data: [{ activeSelectedCompoundFacetNames: _ }, [me]],
                    description: {
                        "class": "SecondLevelSelectionChain",
                        context: {
                            primaryFacetName: [
                                { param: { areaSetContent: _ }}, [me]],
                            subSelectionQry: [
                                [defun, "y", { "#y": _ }],
                                [{ primaryFacetName: _ }, [me]]
                            ],
                            inputData: [
                                [{ subSelectionQry: _ }, [me]],
                                [[{ getImplicitSolutionSet: _ },
                                  [embedding]],
                                 [{ primaryFacetName: _ }, [me]]]]
                        }
                    }
                }
            }
        },
        {
            // if a list of active compound facet names is provided, only
            // those compound facets participate in the selection chain
            
            qualifier: { activeCompoundFacetNames: true },

            context: {
                activeSelectedCompoundFacetNames: [
                    [{ activeCompoundFacetNames: _ }, [me]],
                    [{ notInactiveSelectedCompoundFacetNames: _ }, [me]]],
            }
        },
        {
            qualifier: { inactiveCompoundFacetNames: true },

            context: {
                notInactiveSelectedCompoundFacetNames: [
                    n([{ inactiveCompoundFacetNames: _ }, [me]]),
                    [{ selectedCompoundFacetNames: _ }, [me]]]
            }
        }
    ),
    
    // This is the basic selection chain class. It takes in 'inputData' from
    // its context class [myContext, "SelectionChain"] and performs the
    // selections specified in the values written to its 'selectionValues'
    // writeable ordered set. The result of this selection is provided
    // under the 'solutionSet' context label of this class:
    //
    // [{ solutionSet: _ }, <this area>]
    //
    // In addition, this class provides implicit solution sets for the
    // different facets (that is, the solution set which is the result
    // of applying all selections except for the selections of the given
    // facet). This is provided  
    //
    // This class creates a child 'FacetDataSelector' area for each
    // facets in which selections are defined. Each
    // 'FacetDataSelector' child area performs the selection for its
    // facet on the solution set it receives from the previous
    // 'FacetDataSelector'. The last member of this chain therefore
    // provides the solution set for the full selection chain.
    
    SingleLevelSelectionChain: o({
        context: {

            // input data for the selection chain (default, may be overwritten
            // by derived classes)
            inputData: [{ inputData: _ }, [myContext, "SelectionChain"]],

            // this must point at (or be) a writeable ordered set. The
            // list of selected values for this selection chain is stored here.
            selectedValues: mustBeDefined,
            
            selectedFacetNames: [
                {
                    facetName: _,
                    selected: true,
                },
                [{ selectedValues: _ }, [me]]
            ],

            // facet names which have selections defined and are no explicitly
            // marked as inactive (by default, all facets)
            notInactiveSelectedFacetNames: [
                { selectedFacetNames: _ }, [me]],
            
            // the list of simple facet names which have selections
            // defined in them and are active (by default, all those which
            // have a selection, but this may be restricted, see in variant
            // below).
            activeSelectedFacetNames: [
                { notInactiveSelectedFacetNames: _ }, [me]],
            
            baseFacet: [{ children: { baseSetFacet: _ } }, [me]],
            lastSimpleFacet: [last,
                o(
                    [{ children: { baseSetFacet: _ } }, [me]],
                    [{ children: { facetDataSelector: _ } }, [me]]
                )
            ],
            lastFacet: [{ lastSimpleFacet: _ }, [me]],

            // access to solution sets
            
            solutionSet: [{ solutionSet: _ }, [{ lastFacet: _ }, [me]]],
            
            getImplicitSolutionSet: [
                defun, "facetName",
                [{ solutionSet: _ },
                 [first,
                  // if the facet performs selections, it has an implicit
                  // solution set under the last facet.
                  o([{ implicitFacetName: "facetName" },
                     [{ children: { implicitSolutionSets: _ } },
                      [{ lastFacet: _ }, [me]]]],
                    // otherwise, just take the full solution set
                    [{ lastFacet: _ }, [me]])]]],

            // apply simple projection on solution set (may be overwritten
            // below in case a translation needs to be applied)
            projectOnFacet: [
                defun, o("facetName", "solutionSet"),
                [{ "#facetName": _ }, "solutionSet"]],
            selectOnFacetQry: [
                defun, o("facetName", "values"),
                { "#facetName": "values" }],
            // These functions provide a simple selection of projection
            // on a solution set for a sub-facet of  compound facet.
            // The primary path of the compound query does not appear in
            // these queries as the use of this path depends on the solution
            // set to which it is applied (whether it is already projected
            // on the primary path or not). In this default case, these
            // functions are identical to 'projectOnFacet' and '
            // 'selectOnFacetQry'. If there are translations, however,
            // the translations have to be looked up in a different
            // translation table, so a different version of the function
            // is needed (below)
            projectOnSubFacet: [
                defun, o("primaryFacet", "subFacetName", "solutionSet"),
                [{ "#subFacetName": _ }, "solutionSet"]],
            selectOnSubFacetQry: [
                defun, o("primaryFacet", "subFacetName", "values"),
                { "#subFacetName": "values" }],
        },
        children: {
            baseSetFacet: {
                description: {
                    context: {
                        solutionSet: [{ inputData: _ }, [embedding]],
                    }
                }
            },
            facetDataSelector: {
                data: [_, [{ activeSelectedFacetNames: _ }, [me]]],
                description: {
                    "class": "FacetDataSelector",
                    context: {
                        prevFacet: [first, o([prev, [me]], [{ baseFacet: _ }, [embedding]])],
                    }
                }
            }
        }
    },{
        // if a list of active facet names is provided, only those facets
        // participate in the selection chain
        
        qualifier: { activeFacetNames: true },

        context: {
            activeSelectedFacetNames: [
                [{ activeFacetNames: _ }, [me]],
                [{ notInactiveSelectedFacetNames: _ }, [me]]],
        }
    },{
        // if a list of inactive facet names is provided, only those facets
        // which are not in the list may participate in the selection chain

        qualifier: { inactiveFacetNames: true },

        context: {
            notInactiveSelectedFacetNames: [
                n([{ inactiveFacetNames: _ }, [me]]),
                [{ selectedFacetNames: _ }, [me]]]
        }
    },{
        // some facet translations are defined 
        qualifier: { facetTranslations: true },

        context: {
            projectOnFacet: [
                defun, o("facetName", "solutionSet"),
                [
                    // if there is a translated projection for the given facet,
                    // use that function, otherwise, the standard projection
                    [first,
                     o(
                         // translated projection
                         [{ userFacetProjection: _ },
                          [{ userFacet: "facetName" },
                           [{ facetTranslations: _ }, [me]]]],
                         // simple projection
                         { "#facetName": _ })
                    ],
                    "solutionSet"]],
            // returns the query to use in order to select on the given
            // facet with the given values.
            selectOnFacetQry: [
                defun, o("facetName", "values"),
                [
                    // if there is a translated selection query for the
                    // given facet, use that function, otherwise,
                    // the standard selection
                    [first,
                     o(
                         // translated selection
                         [{ userFacetSelectionQry: _ },
                          [{ userFacet: "facetName" },
                           [{ facetTranslations: _ }, [me]]]],
                         // simple selection
                         [defun, o("v"), { "#facetName": "v" }])
                    ],
                    "values"]],
        }
    },{
        // some compound facet translations are defined 
        qualifier: { subFacetTranslations: true },

        context: {
            // projects only on the sub-facet, the projection on the
            // primary facet path must be performed (if needed) before
            // applying this projection.
            projectOnSubFacet: [
                defun, o("primaryFacetName", "subFacetName", "solutionSet"),
                [
                    // if there is a translated projection for the given facet,
                    // use that function, otherwise, the standard projection
                    [first,
                     o(
                         // get translated projection
                         [{ userFacetProjection: _ },
                          // from the translation area for this sub-facet
                          [{ userFacet: "subFacetName" },
                           [{ facetTranslations: _ },
                            [{ primaryFacet: "primaryFacetName" },
                             [{ subFacetTranslations: _ }, [me]]]]]],
                         // simple projection
                         { "#subFacetName": _ })
                    ],
                    "solutionSet"]],
            // returns the query to use in order to select on the given
            // facet with the given values.
            selectOnSubFacetQry: [
                defun, o("primaryFacetName", "subFacetName", "values"),
                [
                    // if there is a translated selection query for the
                    // given facet, use that function, otherwise,
                    // the standard selection
                    [first,
                     o(
                         // get the translated selection
                         [{ userFacetSelectionQry: _ },
                          // from the translation area for this sub-facet
                          [{ userFacet: "subFacetName" },
                           [{ facetTranslations: _ },
                            [{ primaryFacet: "primaryFacetName" },
                             [{ subFacetTranslations: _ }, [me]]]]]],
                          // simple selection
                          [defun, o("v"), { "#subFacetName": "v" }])
                    ],
                    "values"]],
        }
    }),

    /*--------------------
    Class responsible for the selection on a specific facet.
    Each facet has in its children one ImplicitSolutionSet for each facet in the data.
    --------------------*/
    FacetDataSelector: o(
        {
            context: {
                // required: prevFacet                

                facetName: [{ param: { areaSetContent: _ } }, [me]],

                // facet translation area for this facet (if any)
                translation: [
                    { userFacet: [{ facetName: _ }, [me]] },
                    [{ facetTranslations: _ }, [embedding]]],
                
                // if this is the first facet, 'prevSolutionSet' should be the input data
                prevSolutionSet: [{ solutionSet: _ }, [{ prevFacet: _ }, [me]]],

                // all selected values pertaining to this facet 
                facetSelectedValues: [
                    {
                        facetName: [{ facetName: _ }, [me]],
                        selected: true,
                        value: _
                    },
                    [{ selectedValues: _ }, [embedding]]],

                solutionSet: [
                    [{ facetSelectionQry: _ }, [me]],
                    [{ prevSolutionSet: _ }, [me]]
                ]
            },
            children: {
                implicitSolutionSets: {
                    data: o(
                        [{ facetName: _ }, [me]],
                        [
                            { implicitFacetName: _ },
                            [
                                {
                                    children: { implicitSolutionSets: _ }
                                },
                                [{ prevFacet: _ }, [me]]
                            ]
                        ]
                    ),
                    description: {
                        "class": "ImplicitSolutionSet"
                    }
                }
            }
        },

        {
            qualifier: { translation: false },

            context: {
                facetSelectionQry: [
                    [defun,
                        "x",
                        { "#x": [{ facetSelectedValues: _ }, [me]] }
                    ],
                    [{ facetName: _ }, [me]]
                ],
            }
        },
        
        {
            qualifier: { translation: true },

            context: {
                // if there is a translation area for this facet, the
                // selection query should first convert the values
                // from the user values to the database values and then
                // apply the query on the data facet name.

                dataSelectionValues: [
                    // apply the translation function
                    [{ translateUserValuesToDataValues: _ },
                     [{ translation: _ }, [me]]],
                    // to the user facet values
                    [{ facetSelectedValues: _ }, [me]]],
                    
                facetSelectionQry: [
                    [defun,
                        "x",
                        { "#x": [{ dataSelectionValues: _ }, [me]] }
                    ],
                    [{ dataFacet: _ }, [{ translation: _ },[me]]]
                ]
            }
        }
    ),

    /*--------------------
    --------------------*/
    ImplicitSolutionSet: o(
        {
            context: {
                implicitFacetName: [{ param: { areaSetContent: _ } }, [me]],
                isOfEmbedding: [
                    [{ implicitFacetName: _ }, [me]],
                    [{ facetName: _ }, [embedding]]
                ]
            }
        },
        {
            qualifier: { isOfEmbedding: true },

            context: {
                solutionSet: [{ prevSolutionSet: _ }, [embedding]]
            }
        },
        {
            qualifier: { isOfEmbedding: false },

            context: {
                prevSolutionSet: [
                    { solutionSet: _ },
                    [ // the implicitSolutionSet of the previous facet having the same implicitFacetName
                        { implicitFacetName: [{ implicitFacetName: _ }, [me]] },
                        [
                            { children: { implicitSolutionSets: _ } },
                            [{ prevFacet: _ }, [embedding]]
                        ]
                    ]
                ],

                solutionSet: [
                    [{ facetSelectionQry: _ }, [embedding]],
                    [{ prevSolutionSet: _ }, [me]]
                ]

            }
        }
    ),

    //
    // compound selection chains
    //

    FacetDataSelectorInnerLevel: {
        "class": "FacetDataSelector",
        context: {

            // Access to the translation table, if any, for this
            // compound facet.
            facetTranslations: [
                { children: { facetTranslations: _ }},
                [{ primaryFacet: [{ facetName: _ }, [me]] },
                 [{ children: { subFacetTranslations: _ }},
                  [myContext, "SelectionChain"]]]],
            
            prevFacet: [first, o([prev, [me]],
                                 [{ lastSimpleFacet: _ }, [embedding]])],
            
            // get the selection chain for this facet
            secondLevelSelectionChain: [
                { primaryFacetName: [{ facetName: _ }, [me]] },
                [{ children: { subSelectionChains: _ }}, [embedding]]],

            subSelectionChainFacetDataSelectors: [
                { children: { facetDataSelector: _ } },
                [{ secondLevelSelectionChain: _ }, [me]]
            ],

            multipleFacetSelectionQry: [
                { facetSelectionQry: _ },
                [{ subSelectionChainFacetDataSelectors: _ }, [me]]
            ],

            mergeQry: [merge, [identify, 1, [{ multipleFacetSelectionQry: _ }, [me]]]],

            facetSelectionQry: [
                [defun,
                    "x",
                    { "#x": [{ mergeQry: _ }, [me]] }
                ],
                [{ facetName: _ }, [me]]
            ],
        },
    },

    SecondLevelSelectionChain: {
        "class": "SingleLevelSelectionChain",
        context: {
            topLevelSelectionChain: [
                [embeddingStar, [me]],
                [areaOfClass, "TopLevelSelectionChain"]
            ],

            selectedValues: [
                {
                    facetName: [{ primaryFacetName: _ }, [me]],
                    subFacets: _
                },
                [
                    { selectedValues: _ },
                    [{ topLevelSelectionChain: _ }, [me]]
                ]
            ],

            // this defines a function without arguments which returns the
            // solution set of this selection chain. This is used to allow
            // a single object to represent this solution set, as we sometimes
            // first want to know whether it exists or not.
            getSolutionSet: [
                defun, o(), [{ solutionSet: _ }, [me]]]
        }
    },

    //
    // Facet Translation Classes
    //

    // This class is embedded in a simple selection chain and provides
    // auxiliary translation functions for translations on simple
    // facets in the selection chain. The data from which these areas
    // are created are the user facet name for the facet and the relevant
    // translation object can be fetched rom the embedding area.
    
    FacetTranslation: o(
        {
            context: {
                // The name of the user facet
                userFacet: [{ param: { areaSetContent: _ }}, [me]],
                // translation entry for this facet
                translationEntry: [
                    { userFacet: [{ userFacet: _ }, [me]] },
                    [{ facetTranslations: _ }, [embedding]]],
                // the data facet name for this user facet name
                dataFacet: [{ dataFacet: _ }, [{ translationEntry: _ }, [me]]],
                // The translation entry for this user facet
                translation: [{ translation: _ },
                              [{ translationEntry: _ }, [me]]],
                
                // projection function, projecting the user facet values
                // from a given solution set. This first projects the
                // values of the data facet and then translates them into
                // user values.
                
                userFacetProjection: [
                    defun, "solutionSet",
                    [
                        // apply data->user translation
                        [{ translateDataValuesToUserValues: _ }, [me]],
                        // to the projection on the data facet
                        [[[defun, "dataFacet", { "#dataFacet": _ }],
                          [{ dataFacet: _ },[me]]],
                         "solutionSet"]
                    ]
                ],

                // return the query which would select on the given user
                // values. The returned query uses the translated path and
                // values.
                userFacetSelectionQry: [
                    defun, o("values"),
                    // create a selection on the data facet with translated
                    // values
                    [[defun, o("facetName"),
                      { "#facetName": [
                          [{ translateUserValuesToDataValues: _ }, [me]],
                          "values"],
                      }],
                     [{ dataFacet: _ }, [me]]]
                ]
            }
        },

        {
            // translation table is defined
            qualifier: { translation: true },
            
            context: {
                // translate a set of values in the data into user facet values
                translateDataValuesToUserValues: [
                    defun, "dataValues",
                    // generate the query to select translations based on the
                    // data values and project the corresponding user values
                    [
                        // project the matching user values
                        [[defun, o("x"), { "#x": _ }], [{ userFacet: _ },[me]]],
                        [
                            // selection on the data facet value
                            [[defun, o("x"), { "#x": "dataValues" }],
                             [{ dataFacet: _ }, [me]]],
                            // apply to the translation table
                            [{ translation: _ }, [me]]]]
                ],
                // translate a set of user values into values in the data
                translateUserValuesToDataValues: [
                    defun, "userValues",
                    // generate the query to select translations based on the
                    // user values and project the corresponding database values
                    [
                        // project the matching database values
                        [[defun, o("x"), { "#x": _ }], [{ dataFacet: _ },[me]]],
                        [
                            // selection on the user facet value
                            [[defun, o("x"), { "#x": "userValues" }],
                             [{ userFacet: _ }, [me]]],
                            // apply to the translation table
                            [{ translation: _ }, [me]]]]
                ],
            }
        },

        {
            // no translation table is defined
            qualifier: { translation: false },
            
            context: {
                // no translation needed, return the input unchanged
                translateDataValuesToUserValues: [
                    defun, "dataValues", "dataValues"],
                // no translation needed, return the input unchanged
                translateUserValuesToDataValues: [
                    defun, "userValues", "userValues"]
            }
        }
    ),

    // area to store the facet translations of the sub-facets of a single
    // compound facet (the top level of the compound facet is never
    // translated).
    
    CompoundFacetTranslation: o(
        {
            context: {
                primaryFacet: [{ primaryFacet: _ },
                               [{ param: { areaSetContent: _ }},[me]]],
                facetTranslations: [
                    { facetTranslations: _ },
                    [{ param: { areaSetContent: _ }},[me]]],
            },
            children: {
                facetTranslations: {
                    // user side name of translated facets. 
                    data: [{ userFacet: _ }, [{ facetTranslations: _ }, [me]]],
                    description: {
                        "class": "FacetTranslation",
                    }
                }
            }
        }
    )
}
