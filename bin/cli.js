#! /usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const create_project_1 = require("./scripts/create-project");
const fse = __importStar(require("fs-extra"));
const cp = __importStar(require("child_process"));
const input_line_1 = __importDefault(require("./scripts/input-line"));
const sepStr = `\n::::::::::::::::::::::::::::::\n`;
const pkg = require("../package.json");
process.stdout.write(sepStr);
process.stdout.write(`\n${pkg.name} v${pkg.version}\n`);
const dir = path_1.default.join(process.cwd(), process.argv[2] || "./");
process.stdout.write(`  dirname: ${dir}\n`);
process.stdout.write(`
select project type
- [c]  : cancel to start
- [hp] : homepage (react + etc.)
- [cli]: command line interface application 
- [web]: web application (express + next + etc.)
- [dt] : desktop application (electron + next + etc.)
- [wd] : web and desktop application (express + electron + next + etc.)
`);
const changeDir = () => {
    if (!fse.existsSync(dir)) {
        process.stdout.write(`create dir : ${dir}\n`);
        fse.mkdirSync(dir, { recursive: true });
    }
    cp.spawnSync("cd", [dir], { shell: true, stdio: "inherit", cwd: process.cwd() });
};
const succeededProcess = () => {
    process.stdout.write(`\n${pkg.name} succeeded.\n`);
    if (process.argv[2] != null && process.cwd() !== dir) {
        process.stdout.write(`\nstart with change directory`);
        process.stdout.write(`\n  cd ${process.argv[2]}\n`);
    }
};
(0, input_line_1.default)({ message: `please input (default c) > ` }).then(async (mode) => {
    try {
        switch (mode) {
            case "hp":
                process.stdout.write(`\ncreate homepage...\n`);
                changeDir();
                await (0, create_project_1.create_homepage)(dir);
                succeededProcess();
                break;
            case "cli":
                process.stdout.write(`\ncreate command line interface application...\n`);
                changeDir();
                await (0, create_project_1.create_cli)(dir);
                succeededProcess();
                break;
            case "web":
                process.stdout.write(`\ncreate web application...\n`);
                changeDir();
                await (0, create_project_1.create_web)(dir);
                succeededProcess();
                break;
            case "dt":
                process.stdout.write(`\ncreate desktop application...\n`);
                changeDir();
                await (0, create_project_1.create_desktop)(dir);
                succeededProcess();
                break;
            case "wd":
                process.stdout.write(`\ncreate web and desktop application...\n`);
                changeDir();
                await (0, create_project_1.create_web_desktop)(dir);
                succeededProcess();
                break;
            default:
                process.stdout.write(`\ncancel\n`);
                break;
        }
    }
    catch (err) {
        process.stderr.write(String(err));
        process.stdout.write(`\n${pkg.name} failed.\n`);
    }
    process.stdout.write(`${sepStr}\n`);
}).catch((err) => {
    process.stderr.write(err);
    process.stdout.write(`\n${pkg.name} failed.\n`);
    process.stdout.write(`${sepStr}\n`);
});
