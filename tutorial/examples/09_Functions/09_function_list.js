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

};

var screenArea = {
    display: {
        background: "#bbbbbb"
    },
    //operations
        //ln, log10, logb, exp, plus, minus, mul, div, pow, remainder, greaterThan
        //not, and, or
        //lessThan, lessThanOrEqual, equal, notEqual, greaterThanOrEqual
        //bool
        //empty,notEmpty
        //offset
        //coordinates
        //intersection
        //size
        //reverse, sort
        //sum, min, max
        //map
        //sort
        //first, last
        //prev, next, prevStar, prevPlus, nextStar, nextPlus
        //index
        //pos
        //merge
        //concatStr, subStr
        //range
        //me, embedded, embeddedStar, embedding, embeddingStar, expressionOf, referredOf, intersectionParentOf
        //debugNodeToStr
        //areaOfClass, allAreas, identify
        //overlap
        //pointer
        //sequence
        //arg
        //time
        //changed
        //displayWidth, displayHeight
        //dateToNum, numToDate, stringToNumber
        //floor, ceil, round, abs, sqrt, sign, uminus, evaluateFormula, testFormula, 
            
    context: { 
    
        //--------
        // INDEX
        //--------
        //find the index of an element in a given ordered set
        orFunction: [or, true, false], 
        // -> true       

        //--------
        // INDEX
        //--------
        //find the index of an element in a given ordered set
        indexFunction: [index, o(1,2,3,4), 2], 
        // -> 1
        
        //--------
        // POS
        //--------
        //return the sub-os of a given os according to a given range
        posFunction1: [pos, r(2,5), o(1,2,3,4,5,6,7)], 
        // -> o(3,4,5,6)
        posFunction2: [pos, r(2,-2), o(1,2,3,4,5,6,7)], 
        // -> o(3,4,5,6)
        
        //--------
        // OFFSET        
        //--------
        //return the offset between two points
        offsetFunction1: [offset, {type: "top"}, {type: "bottom"}],
        // -> height of current area
        
        //--------
        // SORT
        //--------
        //sort an os according to a property
        sortFunction: [sort, 
            o(
                {id:1, color:"blue"},{id:1, color:"red"},
                {id:1, color:"orange"},{id:1, color:"yellow"}
            ), 
            {color: "ascending"} //"descending"
        ],
        // -> {id:1, color:"blue"}, {id:1, color:"orange"}, {id:1, color:"red"}, {id:1, color:"yellow"}
        
        //--------
        // TIME
        //--------
        // [time, expr, ?interval, max]
        // When expr changes, this function returns 0, and the elapsed time 
        // from that moment on in steps of interval (in seconds) until max 
        // (also in seconds) has been reached. 
        // If interval is not specified, [time] jumps from 0 to max.
        "^changed": false,        
        timeFunction: [time, [{changed:_},[me]], 0.1, 60]
        // -> time ellapsed or 60 after a minute
        
    },    
    write: {
        onFirstStart: {
            upon: [{changed:_},[me]],
            "false": {
                resetStart: {
                    to: [{ changed: _}, [me]],
                    merge: true
                }
            }
        }
    }  
};