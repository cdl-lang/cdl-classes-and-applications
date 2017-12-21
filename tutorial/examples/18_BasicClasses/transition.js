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


// This function should be used to generate a class which allows a translation
// to take place when the property 'property' becomes true or when it becomes
// false. This transition remains active for 'timeout' seconds after
// the property 'property' becomes true/false.
//
// To use this for a property x, on should do the following:
//
// Define a class using the following function:
//
// var classes = {
//     .....
//     TransitionToX: Transition("X", <timeout for true>, <timeout for false>),
//     .....
// }
//
// One can specify a different timeout form the transition to true and the
// transition to false. If the relevant argument is undefined, no transition
// is defined for the relevant property change).
// Inside the class where the transition takes place, include the class
// TransitionToX and then define the required transition properties
// under the qualifier transitionToX (for the transition when X becomes true)
// or transitionToNotX (for the transition when X becomes false).
//
// o(
//     {
//         "class": o(..., "TransitionToX")
//     },
//     {
//         qualifier: { transitionToX: true },
//         display: {
//             transition: {
//                 left: <timeout>
//             }
//         }
//     },
//     {
//         qualifier: { transitionToNotX: true },
//         display: {
//             transition: {
//                 left: <timeout>
//             }
//         }
//     }
// )
//
// Note that it is probably good to make the timeout used in the definition
// of the class TransitionToX slightly larger than the timeout provided in
// the display.transition section. This is because the timeout countdown
// for disabling the transitionToX property may begin a little before
// the actual transition specified.

function Transition(property, timeoutTrue, timeoutFalse) {
    var cdl = {
        context: {
        },
        write: {
        }
    };

    function capitalizeFirstLetter(s) {
        return s[0].toUpperCase() + s.slice(1);
    }
    
    // create the labels and projections/selection required for this
    // transition object

    // capitalized version of property name
    var cProperty = capitalizeFirstLetter(property);
    
    var transitionLabel = "transitionTo"+cProperty;
    var transitionNotLabel = "transitionToNot"+cProperty;

    var propertySelection = {};
    propertySelection[property] = true;
    var transitionLabelProj = {};
    transitionLabelProj[transitionLabel] = _;
    var transitionNotLabelProj = {};
    transitionNotLabelProj[transitionNotLabel] = _;
    
    var setTransition = {
        upon: [propertySelection, [me]],
    };

    if(timeoutTrue !== undefined) {
        setTransition["true"] = {
            setTransition: {
                to: [transitionLabelProj, [me]],
                merge: true
            }
        }
    };

    if(timeoutFalse !== undefined) {
        setTransition["false"] = {
            setNotTransition: {
                to: [transitionNotLabelProj, [me]],
                merge: true
            }
        }
    };

    var transitionTrueExpiration = undefined;

    if(timeoutTrue !== undefined)
        transitionTrueExpiration = {
            upon: [
                and,
                [transitionLabelProj, [me]],
                [greaterThan,
                 [time, [transitionLabelProj, [me]], timeoutTrue,
                  timeoutTrue], 0]],
            true: {
                transitionExpired: {
                    to: [transitionLabelProj, [me]],
                    merge: false
                }
            }
        };

    var transitionFalseExpiration = undefined;

    if(timeoutFalse !== undefined)
        transitionFalseExpiration = {
            upon: [
                and,
                [transitionLabelProj, [me]],
                [greaterThan,
                 [time, [transitionLabelProj, [me]], timeoutFalse,
                  timeoutFalse], 0]],
            true: {
                transitionExpired: {
                    to: [transitionLabelProj, [me]],
                    merge: false
                }
            }
        };


    if(timeoutTrue !== undefined)
        cdl.context["^"+transitionLabel] = false;
    if(timeoutFalse !== undefined)
        cdl.context["^"+transitionNotLabel] = false;

    if(timeoutTrue !== undefined || timeoutFalse !== undefined)
        cdl.write["setTransitionTo"+cProperty] = setTransition;

    if(timeoutTrue !== undefined) {
        cdl.write["transitionTo"+cProperty+"Expired"] =
            transitionTrueExpiration;
    }

    if(timeoutFalse !== undefined) {
        cdl.write["transitionToNot"+cProperty+"Expired"] =
            transitionFalseExpiration;
    }

    return cdl;
}
