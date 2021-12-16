"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const inputLine = (props) => {
    return new Promise((resolve, reject) => {
        try {
            const rli = readline.createInterface(process.stdin, process.stdout);
            rli.setPrompt(`${props.message}`);
            rli.on("line", (line) => {
                try {
                    rli.close();
                    resolve(line);
                }
                catch (err) {
                    reject(err);
                }
            });
            rli.prompt();
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.default = inputLine;
