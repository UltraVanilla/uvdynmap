import { processLogs, FilterOptions } from "./coreprotect-delta";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/comment/comment";

const optionsTextArea = document.getElementById("coreprotect-delta-options") as HTMLTextAreaElement;
const logsTextArea = document.getElementById("coreprotect-delta-logs") as HTMLTextAreaElement;
const outputTextArea = document.getElementById("coreprotect-delta-output") as HTMLTextAreaElement;

const defaultOptions = `return {
    ignoreRollback: true,
    needSorting: false,
//     whitelistUsernames: [],
//     blacklistUsernames: [],
//     boundingBox: {
//         x: [-698, -492],
//         y: [0, 26],
//         z: [64, 314],
//         invert: false,
//     },
};`;

if (optionsTextArea.value.length === 0) optionsTextArea.value = defaultOptions;
outputTextArea.value = "";

const optionsEditor = CodeMirror.fromTextArea(optionsTextArea, {
    lineNumbers: true,
    mode: "javascript",
    extraKeys: {
        "Ctrl-/": (cm) => cm.execCommand("toggleComment"),
    },
});
const logEditor = CodeMirror.fromTextArea(logsTextArea, {
    lineNumbers: true,
    mode: "null",
});
const outputEditor = CodeMirror.fromTextArea(outputTextArea, {
    lineNumbers: true,
    mode: { name: "javascript", json: true },
});
outputEditor.setSize("100%", 600);

document.getElementById("coreprotect-delta")!.onsubmit = () => {
    try {
        // eval this shit up
        const filterOptions = new Function(optionsEditor.getValue())() as FilterOptions;

        const results = processLogs(logEditor.getValue(), filterOptions);
        outputEditor.setValue(JSON.stringify(results, null, 4));
    } catch (err) {
        alert("Error occured, check javascript console");
        console.error(err);
    }
    return false;
};
