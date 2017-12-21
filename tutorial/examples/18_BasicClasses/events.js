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


// This file defines various basic functionality which is needed when
// handling events.

//
// Event detection clauses
//

// clauses (usually to be used under an 'upon') for detecting various common
// events.

var myMouseDown = [{ type: "MouseDown" }, [myMessage]];
var myMouseUp = [{ type: "MouseUp" }, [myMessage]];
var mouseUp = [{ type: "MouseUp", recipient: "end" }, [message]];
var myClick = [{ type: "MouseUp", subType: o("Click", "DoubleClick") },
               [myMessage]];

var upArrowEvent = [{ type: "KeyDown", key: "Up" }, [myMessage]];
var downArrowEvent = [{ type: "KeyDown", key: "Down" }, [myMessage]];
var leftArrowEvent = [{ type: "KeyDown", key: "Left" }, [myMessage]];
var rightArrowEvent = [{ type: "KeyDown", key: "Right" }, [myMessage]];
