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
    Clickable: o(
        {
            context: {
                "^selected": false
            }
        },
        {
            qualifier: { selected: false },
            write: {
                onClickableMouseDown: {
                    upon: [{ type: "MouseDown" }, [myMessage]],
                    true: {
                        selected: {
                            to: [{selected: _ }, [me]],
                            merge: true
                        }
                    }
                }
            }
        },
        {
            qualifier: { selected: true },
            write: {
                onClickableMouseUp: {
                    upon: [{ type: "MouseUp", recipient: "end" }, [message]],
                    true: {
                        selected: {
                            to: [{selected: _ }, [me]],
                            merge: false
                        }
                    }
                }
            }
        }
    )
};
