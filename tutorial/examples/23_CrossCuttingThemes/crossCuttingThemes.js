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


// This file implements a set of classes which can manage a cross-cutting
// theme hierarchy.

var classes = {

    // Cross-cutting theme logical structure manager
    
    CrossCuttingThemeManager: o(
        {
            context: {

                // interface
                
                // The derived class should define a 'categorization'
                // ordered set which contains an object for each combination
                // of theme and item categorized under this theme.
                //
                // categorization: ?
                //
                // The derived class should provide in themeFieldName the
                // name of the attribute in the objects in 'categorization'
                // which stores the theme name in each of the entries.
                //
                // themeFieldName: ?
                //
                // The derived class should provide in itemFieldName the
                // name of the attribute in the objects in 'categorization'
                // which stores the item name in each of the entries.
                //
                // itemFieldName: ?

                //
                // Access functions
                //
                
                // projection to extract themes from catgorization database
                getThemes: [[defun, "y", { "#y": _ }],
                            [{ themeFieldName: _ }, [me]]],
                // function to create a selection query on the theme field
                // which selects the theme values given as the argument
                // "themeValues" to the function
                selectThemes: [defun, "themeValues",
                               [[defun, "y", { "#y": "themeValues" }],
                                [{ themeFieldName: _ }, [me]]]],

                // projection to extract items from catgorization database
                getItems: [[defun, "y", { "#y": _ }],
                           [{ itemFieldName: _ }, [me]]],
                // function to create a selection query on the item field
                // which selects the item values given as the argument
                // "itemValues" to the function
                selectItems: [defun, "itemValues",
                              [[defun, "y", { "#y": "itemValues" }],
                               [{ itemFieldName: _ }, [me]]]],

                // This defines a function which queries on the given
                // themes and projects on the items
                // xxxxxx this does not seem to work, generates
                // a multi-projection
                /* getItemsByThemes: [defun, "themes",
                   [[defun, o("x","y"),
                   { "#x": "themes", "#y": _ }],
                   [{ themeFieldName: _ }, [me]],
                   [{ itemFieldName: _ }, [me]]]],*/

                getItemsByThemes: [
                    defun, "themeValues",
                    [[{ getItems: _ }, [me]],
                     [[[{ selectThemes: _ }, [me]], "themeValues"],
                      [{ categorization: _ }, [me]]]]],

                // returns the full entries in the categorization database
                // which have one of the given themes. It is up to the caller
                // to then look at the appropriate matching property.
                getItemEntriesByThemes: [
                    defun, "themeValues",
                    [[[{ selectThemes: _ }, [me]], "themeValues"],
                      [{ categorization: _ }, [me]]]
                ],
                
                //
                // theme subsets
                //
                
                allThemes: [_, [[{ getThemes: _ }, [me]],
                                [{ categorization: _ }, [me]]]],
                
                // themes which are contained in other themes
                subThemes: [{ containedThemes: _ },
                            [{ children: { themes: _ }}, [me]]],
                topLevelThemes: [n([{ subThemes: _ }, [me]]),
                                 [{ allThemes: _ }, [me]]]
            },
            
            children: {
                // one item per cross-cutting-theme
                themes: {
                    data: [{ allThemes: _ }, [me]],
                    description: {
                        "class": "CrossCuttingTheme"
                    }
                }
            }
        }
    ),
    
    CrossCuttingTheme: o(
        {
            context: {
                // the full categorization data
                categorization: [{ categorization: _ }, [embedding]],
                // projection to extract theme from catgorization database
                getThemes: [{ getThemes: _ }, [embedding]],
                // function to create a selection query on the theme field
                // which selects the theme values given as the argument to
                // this function.
                selectThemes: [{ selectThemes: _ }, [embedding]],
                // projection to extract item names from catgorization database
                getItems: [{ getItems: _ }, [embedding]],
                // function to create a selection query on the item field
                // which selects the item values given as the argument to
                // this function.
                selectItems: [{ selectItems: _ }, [embedding]],

                // name of this cross-cutting theme
                myTheme: [{ param: { areaSetContent: _ }}, [me]],
                // the set of entries for this theme (that is, the set of
                // all items for this theme)
                themeItems: [
                    [[{ selectThemes: _ }, [me]], [{ myTheme: _ }, [me]]],
                    [{ categorization: _ }, [me]]],

                itemValues: [
                    [{ getItems: _ }, [me]],
                    [{ themeItems: _ }, [me]]],

                // themes whose set of intervention fields are not contained
                // in the set of intervention themes of this theme
                nonContainedThemes: [
                    _,
                    [[{ getThemes: _ }, [me]],
                     [
                         [[{ selectItems: _ }, [me]],
                          n([{ itemValues: _ }, [me]])],
                         
                         [{ categorization: _ }, [me]]]]
                ],

                // themes which are not in the list of 'nonContainedThemes'
                // an are not this theme itself, which means that these are
                // the themes whose set of intervention fields is contained
                // in this theme.
                containedThemes: [
                    _,
                    [[{ getThemes: _ }, [me]],
                     [[[{ selectThemes: _ }, [me]],
                       n(o([{ nonContainedThemes: _ }, [me]],
                           [{ myTheme: _  }, [me]]))],
                      [{ categorization: _ }, [me]]]]
                ]
            }
        }
    )
};
