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


// %%include%%: "../../18_BasicClasses/reference.js"

// This file provides classes which allow access to different ESIF
// data. Each class provides access to one or more types of data.
// Each type of data can either be fetched from the persistence server
// or from a local file.
//
// In addition to providing access to the raw data, these classes sometimes
// also provide initial processing for the data (such as, for example,
// creating the list of dimension types or providing various translation
// tables).

var classes = {

    // This class should be defined close to the root of the application
    // and provides information for all databases used by the application.
    // Speicifically, the application is required to define the following
    // (see explanation in the class definition below).
    //
    // 

    ESIFDataContext: {

        context: {
            // this is the path from the directory in which the application
            // was defined to the main data directory
            pathToData: mustBeDefined,

            // this is where labels, fields and colors are specified
            "^colorSelected": "#fc0",
            "^colorPlanned": "#1f78b4",
            "^colorTotal": "#a6cde2",
            totalLabel: "total",
            labeledFieldsColors: o(
                { label: "planned", field: "Planned_Total_Amount_Notional", color: [{ colorTotal: _ }, [me]] },
                { label: "decided", field: "Planned_EU_amount", color: [{ colorPlanned: _ }, [me]] },
                { label: "spent", field: "Total_Eligible_Costs_selected_Fin_Data", color: [{ colorSelected: _ }, [me]] }
            )

        }
    },

    // Base class for various ESIF databases. This is inherited by every
    // specific class for providing a specific database (one area per
    // database). For each database, the inheriting class must provide
    // the following context labels:
    //
    // dataFileName: the name of the local file from which the data
    //     can be read (this is mainly for local testing). This file
    //     path should be relative to the directory pointed at by
    //     [{ pathToData: _ }, [myContext, "ESIFData"]],
    // databaseName: the name of the database on the persistence server.

    ESIFDatabase: o({

        context: {
            // should the DB on the remote server be used (set to false
            // to use a local copy of the data)
            useDB: [arg, "useDB", true],
            dataFileName: mustBeDefined,
            databaseName: mustBeDefined,

            // true when the top level of the database has been completely
            // loaded
            allDataLoaded: [notEmpty, [{ dataTable: _ }, [me]]],
        }
    },{
        qualifier: { useDB: true },
        
        context: {
            databaseID: [{ id: _, name: [{ databaseName: _ }, [me]] }, [databases]],
            dataTable: [database, [{ databaseID: _}, [me]]],
            dataAttributes: [{ attributes: _, id: [{ databaseID: _}, [me]] }, [databases]]
        }
    }, {
        // fetch data from local file
        qualifier: { useDB: false },

        context: {
            fileName: [
                concatStr,
                o([{ pathToData: _ }, [myContext, "ESIFData"]],
                  [{ dataFileName: _ }, [me]])
            ],
            dataTable: [{ data: _ }, [datatable, [{ fileName: _ }, [me]]]],
            dataAttributes: [{ attributes: _ }, [datatable, [{ fileName: _ }, [me]]]]
        }
    }),


    //
    // ESIF Categorised planned vs. implemented database
    //

    ESIFCategorisationData: o({

        "class": "ESIFDatabase",

        context: {
            // path to relevant data file under the 'pathToData'.
            dataFileName: "/ESIF/ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.csv",
            databaseName: "plannedvsimplemented",

            // input data for selection chains
            inputData: [{ dataTable: _ }, [me]],

            // the dimension types available in the data
            dimensionTypes: [_, [{ Dimension_Type: _ },
            [{ inputData: _ }, [me]]]],
            // all facets currently available in the database
            allDataFacetNames: [{ name: _ },
                                [{ dataAttributes: _ }, [me]]],
            
            // each dimension type defines a virtual facet, but they
            // all look at the same facet in the database. We here therefore
            // define a translation table to translate each dimension type
            // to the facet "Dimension_title".
            dimensionFacetTranslation: o(
                [
                    map,
                    [defun, "type",
                        { userFacet: "type", dataFacet: "Dimension_title" }],
                    [n("InterventionField"), [{ dimensionTypes: _ }, [me]]]
                ],
                { userFacet: "InterventionField", dataFacet: "Dimension_code" }
            )
        }

    }),

    ESIFCCIData: o({

        "class": "ESIFDatabase",

        context: {
            // path to relevant data file under the 'pathToData'.
            dataFileName: "/ESIF/cci_lookup_table.json",
            databaseName: "ccilookup",

            ccis: [{ data: _ }, [{ cciTable: _ }, [me]]]
        }
    }),

    // This class provides access to the table mapping each intervention
    // field to the cross-cutting themes it belongs to. In addition, this
    // table stores the climate and biodiversity weighting for each
    // intevention field. For more information, see ESIFCrossCuttingThemes.js.

    ESIFCrossCuttingThemeData: o({

        "class": "ESIFDatabase",

        context: {
            // path to relevant data file under the 'pathToData'.
            dataFileName: "/ESIF/ESIF_2014-2020_Categorisation_Crosscutting_Themes_Lookup.csv",
            databaseName: "crosscuttingThemeLookup",

            // The full data, including both the categorization information
            // and the weighting information
            categorizationWithWeights: [{ dataTable: _ }, [me]],

            // the categorization with weights also contains lines for
            // climate and biodeiversity weighting, which are removed
            // here, since they do nto have a numeric code
            categorization: [
                {
                    Cross_cutting_theme_code: r(-Infinity, Infinity),
                },
                [{ categorizationWithWeights: _ }, [me]]],
        }
    }),

    // Table specifying shorter display names for (some) cross cutting themes.

    ESIFCrossCuttingThemeDisplayData: o({

        "class": "ESIFDatabase",

        context: {
            // path to relevant data file under the 'pathToData'.
            dataFileName: "/ESIF/ESIF_2014-2020_Categorisation_Crosscutting_Themes_Display.csv",
            databaseName: "crosscuttingThemeDisplay",

            // translation from the original theme names in the database
            // to the displayed theme names. Themes which do not appear
            // in this table do not require any translation.
            themeTranslation: [{ dataTable: _ }, [me]]
        }
    })
};
