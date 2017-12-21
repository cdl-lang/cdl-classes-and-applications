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

var enterEvent = [{
      type: "KeyDown",
      key: "Return",
      recipient: "end" // this is the polite way to handle keyboard events - allows an area inFocus to handle this event (and possible terminate its propagation)
},
[message]
];

var ctrlEnterEvent = [{
      type: "KeyDown",
      key: "Return",
      modifier: "control",
      recipient: "end"
},
[message]
];

var noCtrlEnterEvent = [and,
      [{
            type: "KeyDown",
            key: "Return",
            recipient: "end"
      },
      [message]
      ],
      [
            n({ modifier: "control" }),
            [message]
      ]
];

var delEvent = [{
      type: "KeyDown",
      key: "Del",
      recipient: "end"
},
[message]
];

var escEvent = [{
      type: "KeyDown",
      key: "Esc",
      recipient: "end"
},
[message]
];

var backspaceEvent = [{
      type: "KeyDown",
      key: "Backspace",
      recipient: "end"
},
[message]
];

var leftArrowEvent = [ // note: this is a not-shift event!
      {
            type: "KeyDown",
            key: "Left",
            modifier: n("shift"),
            recipient: "end"
      },
      [message]
];
var rightArrowEvent = [ // note: this is a not-shift event!
      {
            type: "KeyDown",
            key: "Right",
            modifier: n("shift"),
            recipient: "end"
      },
      [message]
];

var shiftLeftArrowEvent = [
      {
            type: "KeyDown",
            key: "Left",
            modifier: "shift",
            recipient: "end"
      },
      [message]
];
var shiftRightArrowEvent = [
      {
            type: "KeyDown",
            key: "Right",
            modifier: "shift",
            recipient: "end"
      },
      [message]
];

var homeEvent = [ // note: this is a non-shift event!
      {
            type: "KeyDown",
            key: "Home",
            modifier: n("shift"),
            recipient: "end"
      },
      [message]
];
var endEvent = [ // note: this is a non-shift event!
      {
            type: "KeyDown",
            key: "End",
            modifier: n("shift"),
            recipient: "end"
      },
      [message]
];

var shiftHomeEvent = [
      {
            type: "KeyDown",
            key: "Home",
            modifier: "shift",
            recipient: "end"
      },
      [message]
];
var shiftEndEvent = [
      {
            type: "KeyDown",
            key: "End",
            modifier: "shift",
            recipient: "end"
      },
      [message]
];

var shiftTabOrLeftArrowEvent = o(
      [
            {
                  type: "KeyDown",
                  key: "Left",
                  recipient: "end"
            },
            [message]
      ],
      [
            {
                  type: "KeyDown",
                  key: "Tab",
                  modifier: "shift",
                  recipient: "end"
            },
            [message]
      ]
);

var tabOrRightArrowEvent = o(
      [
            {
                  type: "KeyDown",
                  key: "Right",
                  recipient: "end"
            },
            [message]
      ],
      [
            {
                  type: "KeyDown",
                  key: "Tab",
                  modifier: n("shift"),
                  recipient: "end"
            },
            [message]
      ]
);
var anyKeyUp = [
      {
            type: "KeyUp",
            recipient: "end"
      },
      [message]
];

var upArrowEvent = [
      {
            type: "KeyDown",
            key: "Up",
            recipient: "end"
      },
      [message]
];

var downArrowEvent = [and,
      [{ param: { pointerInArea: _ } }, [me]],
      [
            {
                  type: "KeyDown",
                  key: "Down",
                  recipient: "end"
            },
            [message]
      ]
];

var pageUpEvent = [and,
      [{ param: { pointerInArea: _ } }, [me]],
      [
            {
                  type: "KeyDown",
                  key: "PageUp",
                  recipient: "end"
            },
            [message]
      ]
];

var pageDownEvent = [and,
      [{ param: { pointerInArea: _ } }, [me]],
      [
            {
                  type: "KeyDown",
                  key: "PageDown",
                  recipient: "end"
            },
            [message]
      ]
];

var upWheelEvent = [and, // ie the wheel is rolled away from the user
      [{ type: "Wheel" }, [myMessage]],
      [lessThan, [{ deltaY: _ }, [myMessage]], 0]
];

var downWheelEvent = [and, // ie the wheel is rolled towards the user
      [{ type: "Wheel" }, [myMessage]],
      [greaterThan, [{ deltaY: _ }, [myMessage]], 0]
];

var keyboardScrollEvent = o(
      upArrowEvent,
      downArrowEvent,
      leftArrowEvent,
      rightArrowEvent,
      pageUpEvent,
      pageDownEvent,
      upWheelEvent,
      downWheelEvent,
      homeEvent,
      endEvent
);
var mouseDownEvent = [{ type: "MouseDown" }, [myMessage]];

var ctrlMouseDownEvent = [
      {
            type: "MouseDown",
            modifier: "control"
      },
      [myMessage]
];

var shiftMouseDownEvent = [
      {
            type: "MouseDown",
            modifier: "shift"
      },
      [myMessage]
];

var shiftCtrlMouseDownEvent = [and,
      [{ type: "MouseDown" }, [myMessage]],
      [{ modifier: "shift" }, [myMessage]],
      [{ modifier: "control" }, [myMessage]]
];

var noCtrlMouseDownEvent = [and,
      [{ type: "MouseDown" }, [myMessage]],
      [not, [{ modifier: "control" }, [myMessage]]]
];

var noShiftMouseDownEvent = [and,
      [{ type: "MouseDown" }, [myMessage]],
      [not, [{ modifier: "shift" }, [myMessage]]]
];

var ctrlNoShiftMouseDownEvent = [and,
      [
            {
                  type: "MouseDown",
                  modifier: "control"
            },
            [myMessage]
      ],
      [not, [{ modifier: "shift" }, [myMessage]]]
];

var shiftNoCtrlMouseDownEvent = [and,
      [
            {
                  type: "MouseDown",
                  modifier: "shift"
            },
            [myMessage]
      ],
      [not, [{ modifier: "control" }, [myMessage]]]
];

var noShiftNoCtrlMouseDownEvent = [and,
      [{ type: "MouseDown" }, [myMessage]],
      [not, [{ modifier: "shift" }, [myMessage]]],
      [not, [{ modifier: "control" }, [myMessage]]]
];

var noModifiersMouseDownEvent = [and,
      [{ type: "MouseDown" }, [myMessage]],
      [not, [{ modifier: _ }, [myMessage]]]
];

var mouseUpEvent = [{ type: "MouseUp" }, [myMessage]];

var mouseUpNotMouseClickEvent = [
      {
            type: "MouseUp",
            subType: n("Click", "DoubleClick"),
            recipient: "end"
      },
      [message]
];

var mouseClickEvent = [{ type: "MouseUp", subType: "Click" }, [myMessage]];

var shiftMouseClickEvent = [
      {
            subType: "Click",
            modifier: "shift"
      },
      [myMessage]
];

var ctrlMouseClickEvent = [
      {
            subType: "Click",
            modifier: "control"
      },
      [myMessage]
];

var noShiftMouseClickEvent = [and,
      [{ subType: "Click" }, [myMessage]],
      [not, [{ modifier: "shift" }, [myMessage]]]
];

var noCtrlMouseClickEvent = [and,
      [{ subType: "Click" }, [myMessage]],
      [not, [{ modifier: "control" }, [myMessage]]]
];

var mouseDoubleClickEvent = [
      {
            type: "MouseUp", // referring to subType: "DoubleClick" isn't enough, as it is also a subType of type: "MouseGestureExpired"
            subType: "DoubleClick"
      },
      [myMessage]
];

var mouseClickExpiredEvent = [
      {
            type: "MouseGestureExpired",
            subType: "Click"
      },
      [myMessage]
];

var mouseDoubleClickExpiredEvent = [
      {
            type: "MouseGestureExpired",
            subType: "DoubleClick"
      },
      [myMessage]
];

var anyMouseDownEvent = [
      {
            type: "MouseDown",
            recipient: "end"
      },
      [message]
];

var anyMouseUpEvent = [
      {
            type: "MouseUp",
            recipient: "end"
      },
      [message]
];

var anyMouseClickEvent = [
      {
            subType: "Click",
            recipient: "end"
      },
      [message]
];

var anyMouseDoubleClickEvent = [
      {
            type: "MouseUp", // referring to subType: "DoubleClick" isn't enough, as it is also a subType of type: "MouseGestureExpired"
            subType: "DoubleClick",
            recipient: "end"
      },
      [message]
];

var altShiftKeyEvent = [and,
      [{ modifier: "alt" }, [message]],
      [{ modifier: "shift" }, [message]],
      [
            {
                  type: "KeyDown",
                  key: [{ altShiftKey: _ }, [me]],
                  recipient: "end"
            },
            [message]
      ]
];

var mouseDownReceivedBy = [defun,
      o("areas"),
      [
            [
                  {
                        type: "MouseDown",
                        recipient: _
                  },
                  [message]
            ],
            "areas"
      ]
];

var mouseDownHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        type: "MouseDown",
                        recipient: "end"
                  },
                  [message]
            ],
            [
                  [{ handledBy: _ }, [message]],
                  "areas"
            ]
      ]
];

var mouseDownNotHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        type: "MouseDown",
                        recipient: "end"
                  },
                  [message]
            ],
            [not,
                  [
                        [{ handledBy: _ }, [message]],
                        "areas"
                  ]
            ]
      ]
];

var mouseDownOutsideMeEvent = [mouseDownNotHandledBy,
      [me]
];

var mouseUpNotHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        type: "MouseUp",
                        recipient: "end"
                  },
                  [message]
            ],
            [not,
                  [
                        [{ handledBy: _ }, [message]],
                        "areas"
                  ]
            ]
      ]
];

var mouseUpOutsideMeEvent = [mouseUpNotHandledBy,
      [me]
];

var mouseUpHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        type: "MouseUp",
                        recipient: "end"
                  },
                  [message]
            ],
            [
                  [{ handledBy: _ }, [message]],
                  "areas"
            ]
      ]
];

var clickHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        subType: "Click",
                        recipient: "end"
                  },
                  [message]
            ],
            [
                  [{ handledBy: _ }, [message]],
                  "areas"
            ]
      ]
];

var fileChoiceHandledBy = [defun,
      o("areas"),
      [and,
            [
                  {
                        type: "FileChoice",
                        recipient: "end"
                  },
                  [message]
            ],
            [
                  [{ handledBy: _ }, [message]],
                  "areas"
            ]
      ]
];

var keyEvent = [defun,
      o("type", "key"),
      [
            {
                  type: "type",
                  key: "key",
                  recipient: "end"
            },
            [message]
      ]
];

var keyCtrlEvent = [defun,
      o("type", "key"),
      [
            {
                  modifier: "control",
                  type: "type",
                  key: "key",
                  recipient: "end"
            },
            [message]
      ]
];

var ctrlXEvent = [keyCtrlEvent,
      "KeyDown",
      "X"];

var ctrlCEvent = [keyCtrlEvent,
      "KeyDown",
      "C"];

var ctrlVEvent = [keyCtrlEvent,
      "KeyDown",
      "V"];

var ctrlAEvent = [keyCtrlEvent,
      "KeyDown",
      "A"];

var ctrlSEvent = [keyCtrlEvent,
      "KeyDown",
      "S"
];



