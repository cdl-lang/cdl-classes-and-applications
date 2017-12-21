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

    //////////////////////////////////////////////////////
    // API:
    // 1. transitionable: [me], by default. This areaRef should be of a Movable class.
    // 2. Inheriting classes may override allowTransition
    //////////////////////////////////////////////////////
    MovableTransition: o(
        { // variant-controller
            qualifier: "!",
            context: {
                allowTransition: [{ allowMovableTransition:_ }, [me]]
            }           
        },
        { // default
            "class": "GeneralArea",
            context: {
                transitionable: [me],
                allowMovableTransition: [not, [{ transitionable: { movableController: { docMoving:_ } } }, [me]]]
            }
        }
    ),

    //////////////////////////////////////////////////////
    // API:
    // 1. see MovableTransition API. transitionable should inherit SnappableVisReorderable.
    // 2. Inheriting classes may override allowTransition
    //////////////////////////////////////////////////////
    SnappableVisReorderableTransition: o(
        { // variant-controller
            qualifier: "!",
            context: {
                allowTransition: [{ allowSnappableVisReorderableTransition:_ }, [me]]
            }           
        },
        { // default
            "class": o("MovableTransition", "DraggableToReorderTransition"),
            context: {
                allowSnappableVisReorderableTransition: [and,
                                                         [{ allowMovableTransition:_ }, [me]],
                                                         [{ allowDraggableToReorderTransition:_ }, [me]]
                                                        ]
            }
        }
    )
};
