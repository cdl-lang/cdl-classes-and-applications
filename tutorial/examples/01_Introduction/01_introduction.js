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

var screenArea = {
  display: {
    background:"#bbbbbb",
  },
  children: {
    mydata: {
      description: {
        context: {
          someInfo: o( { x: 1, y:2 }, { x:2, y:3 }, { x:3, y:4 } )
        },
        position: {
          left: 50,
          top: 50,
          height: 100,
          width: 150,
          topOfFirstChild: {
            point1: {type: "top", element: [me]},
            point2: {type: "top", element: 
              [first, [{children: { dataCells: _ }}, [me]]]},
            equals: 10
          }      	
        },
        display: {
          background: "white",      	
        },
        children: {
          dataCells: {
            data: [{someInfo: _}, [me]],
            description: {
              position: {
                left: 3,
                right: 3,            	
                height: 20,
                topFromPrevious: {
                  point1: {
                    type: "bottom",
                    element: [prev, [me]]
                  },
                  point2: {type: "top", element: [me]},
                  equals: 10
                }
              },
              display: {
                background: "pink",
                text: {
                  value: [
                    {param: {areaSetContent: _}}, [me]
                  ]
                }
              }
            }
          }
        }
      }
    }	
  }
};