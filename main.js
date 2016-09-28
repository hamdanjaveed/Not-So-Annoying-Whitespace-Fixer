/*
 * The Hamdan License
 * Copyright (c) 2014 Hamdan Javeed. All rights reserved (yes, all of them).
 *
 * Do whatever. Don't be dumb.
 * Credit appreciated.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Not So Annoying Whitespace Fixer Extension
    Trims trailing whitespace, but NOT the line the cursor is currently on.
    Ensures that the last line is a \n.
*/

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager');
    var Commands = brackets.getModule('command/Commands');
    var EditorManager = brackets.getModule("editor/EditorManager");
    var DocumentManager = brackets.getModule("document/DocumentManager");

    $(CommandManager).on("beforeExecuteCommand", function(event, type) {
        if (type === "file.save") {
            var editor = EditorManager.getFocusedEditor();
            var doc = DocumentManager.getCurrentDocument();
            var cursorPos = editor.getCursorPos();

            var text = doc.getText();
            var linesToTrim = [];
            var rawLines = text.split("\n");
            var hasWhitespace = /\s+$/;
            var isOnlyWhitespace = /^\s+$/

            // go through all the lines and add the indices of the lines with whitespace (ignoring the line the cursor is on)
            for (var i = 0; i < rawLines.length; i++) {
                if (cursorPos.line !== i && hasWhitespace.test(rawLines[i]) && !isOnlyWhitespace.test(rawLines[i])) linesToTrim.push(i);
            }

            doc.batchOperation(function() {
                // if the text does not have a new line at the end
                if (!/\n$/.test(text)) {
                    // append a new line to the end of the text
                    var lastLine = rawLines[rawLines.length - 1];
                    if (!/^$/.test(lastLine)) {
                        doc.replaceRange(lastLine + "\n", {
                            line: rawLines.length - 1,
                            ch: 0
                        }, {
                            line: rawLines.length - 1,
                            ch: lastLine.length
                        });
                    }
                }

                if (!linesToTrim.length) return;

                // for each line that needs to be trimmed, trim it
                for (var i = 0; i < linesToTrim.length; i++) {
                    var lineIndex = linesToTrim[i];

                    var startRange = {
                        line: lineIndex,
                        ch: 0
                    };

                    var endRange = {
                        line: lineIndex,
                        ch: rawLines[lineIndex].length
                    };

                    doc.replaceRange(rawLines[lineIndex].replace(/\s+$/, ''), startRange, endRange);
                }
            });
        }
    });
});
