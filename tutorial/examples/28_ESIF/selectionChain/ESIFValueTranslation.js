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


// This file implements classes which support the translation of values,
// for example, translating the code or name appearing in the database
// to the string displayed to the user.

var classes = {

    // This class (which should be included somewhere dominating the
    // relevant elements) provides (under 'displayNameTranslation')
    // a set of translation functions which translate the internal
    // name in the database to the value to be displayed.
    // To get the translation function for the appropriate facet, use
    // the query:
    // [{ getDisplayName: _ , facetName: [{ facetName: _ }, [me]] },
    //  [{ displayNameTranslation: _ }, [my, "ESIFValueTranslation"]]]
    //
    // (this returns (if found) a function which translates the internal
    // name to the display name).
    
    ESIFValueTranslation: o(
        {
            context: {

                displayNameTranslation: o(
                    {
                        facetName: "Dimension_Type",
                        getDisplayName: [
                            defun, "codeName",
                            [first, o([{ codeName: "codeName",
                                         fullName: _ },
                                       [{ dimensionTypeTranslation: _ }, [me]]],
                                      "codeName")]
                        ]
                    },
                    {
                        facetName: "MS",
                        getDisplayName: [
                            defun, "code",
                            [first, o([{ MS: "code", country: _ },
                                       [{ MSToCountryTranslation: _ }, [me]]],
                                      "code")]
                        ]
                    },
                    {
                        facetName: "category_of_region",
                        getDisplayName: [
                            defun, "cat",
                            [first, o([{ category: "cat", categoryName: _ },
                                       [{ catOfRegionTranslation: _ }, [me]]],
                                      "cat")]
                        ]
                    },
                    {
                        facetName: "TO",
                        getDisplayName: [
                            defun, "code",
                            [first, o([{ toCode: "code", name: _ },
                                       [{ TOCodeTransaltion: _ }, [me]]],
                                      "code")]
                        ]
                    },
                    {
                        facetName: "InterventionField",
                        getDisplayName: [
                            { translateIFCodeToShort: _ },
                            [areaOfClass, "ESIFCrossCuttingThemeManager"]
                        ]
                    }
                ),
                dimensionTypeTranslation: o(
                    { codeName: "Economic Activity",
                      fullName: "Economic Activity" },
                    { codeName: "EsfSecondaryTheme",
                      fullName: "ESF Secondary Theme" },
                    { codeName: "FinanceForm",
                      fullName: "Finance Form" },
                    { codeName: "InterventionField",
                      fullName: "Intervention Field" },
                    { codeName: "Location",
                      fullName: "Location" },
                    { codeName: "Territorial Delivery",
                      fullName: "Territorial Delivery" },
                    { codeName: "Territory",
                      fullName: "Territory" },
                ),
                MSToCountryTranslation: o(
                    {MS: "AT", country: "Austria"},
                    {MS: "BE", country: "Belgium"},
                    {MS: "BG", country: "Bulgaria"},
                    {MS: "CY", country: "Cyprus"},
                    {MS: "CZ", country: "Czech Republic"},
                    {MS: "DE", country: "Germany"},
                    {MS: "DK", country: "Denmark"},
                    {MS: "EE", country: "Estonia"},
                    {MS: "GR", country: "Greece"},
                    {MS: "ES", country: "Spain"},
                    {MS: "FI", country: "Finland"},
                    {MS: "FR", country: "France"},
                    {MS: "HR", country: "Croatia"},
                    {MS: "HU", country: "Hungary"},
                    {MS: "IE", country: "Ireland"},
                    {MS: "IT", country: "Italy"},
                    {MS: "LT", country: "Lithuania"},
                    {MS: "LU", country: "Luxembourg"},
                    {MS: "LV", country: "Latvia"},
                    {MS: "MT", country: "Malta"},
                    {MS: "NL", country: "Netherlands"},
                    {MS: "PL", country: "Poland"},
                    {MS: "PT", country: "Portugal"},
                    {MS: "RO", country: "Romania"},
                    {MS: "SE", country: "Sweden"},
                    {MS: "SI", country: "Slovenia"},
                    {MS: "SK", country: "Slovakia"},
                    {MS: "UK", country: "United Kingdom"},
                    {MS: "TC", country: "Territorial Cooperation"}
                ),
                catOfRegionTranslation: o(
                    { category: "Less developed",
                      categoryName: "Less Developed" },
                    { category: "More developed",
                      categoryName: "More Developed" },
                    { category: "Outermost or Northern Sparsely Populated",
                      categoryName: "Outermost or Northern" },
                    { category: "Transition", categoryName: "Transition" },
                    { category: "VOID", categoryName: "unspecified" },
                ),
                TOCodeTransaltion: o(
                    { toCode: 1,
                      name: "Research & Innovation",
                      fullName: "Strengthening research, technological development and innovation",
                    },
                    { toCode: 2,
                      name: "Information & Communication Technologies",
                      fullName: "Enhancing access to, and use and quality of, information and communication technologies",
                    },
                    { toCode: 3,
                      name: "Competitiveness of SMEs",
                      fullName: "Enhancing the competitiveness of small and medium-sized enterprises",
                    },
                    { toCode: 4,
                      name: "Low-Carbon Economy",
                      fullName: "Supporting the shift towards a low-carbon economy in all sectors",
                    },
                    { toCode: 5,
                      name: "Climate Change Adaptation & Risk Prevention",
                      fullName: "Promoting climate change adaptation, risk prevention and management"
                    },
                    { toCode: 6,
                      name: "Environment Protection & Resource Efficiency",
                      fullName: "Preserving and protecting the environment and promoting resource efficiency"
                    },
                    { toCode: 7,
                      name: "Network Infrastructures in Transport and Energy",
                      fullName: "Promoting sustainable transport and removing bottlenecks in key network infrastructures"
                    },
                    { toCode: 8,
                      name: "Sustainable & Quality Employment",
                      fullName: "Promoting sustainable and quality employment and supporting labour mobility"
                    },
                    { toCode: 9,
                      name: "Social Inclusion",
                      fullName: "Promoting social inclusion and combating poverty and any discrimination"
                    },
                    { toCode: 10,
                      name: "Educational & Vocational Training",
                      fullName: "Investing in education, training and vocational training for skills and lifelong learning"
                    },
                    { toCode: 11,
                      name: "Efficient Public Administration",
                      fullName: "Enhancing the institutional capacity of public authorities and stakeholders and an efficient public administration"
                    },
                    { toCode: 12,
                      name: "Outermost & Sparsely Populated",
                      fullName: "Outermost & Sparsely Populated",
                    },
                    { toCode: "DM",
                      name: "Discontinued Measures",
                      fullName: "Discontinued Measures",
                    },
                    { toCode: "TA",
                      name: "Technical Assistance",
                      fullName: "Technical Assistance",
                    },
                    { toCode: "MULTI",
                      name: "Multiple Thematic Objectives",
                      fullName: "Multiple Thematic Objectives"
                    }
                )
            }
        }
    )
};
