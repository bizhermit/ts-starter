#! /usr/bin/env node

import path from "path";
import { create_cli, create_desktop, create_staticWeb, create_module, create_web, create_web_desktop } from "../dist";
import * as fse from "fs-extra";
import * as cp from "child_process";

const sepStr = `\n::::::::::::::::::::::::::::::\n`;
const pkg = require("../package.json") as {[key: string]: any};

process.stdout.write(sepStr);
process.stdout.write(`\n${pkg.name} v${pkg.version}\n`);

const dir = path.join(process.cwd(), process.argv[2] || "./");
process.stdout.write(`  dirname: ${dir}\n`);

const getArgV = (key: string) => {
    const index = process.argv.findIndex(v => v === key);
    if (index < 0) return undefined;
    const val = process.argv[index + 1];
    if (val.startsWith("-")) return undefined;
    return val;
};

const argProjectType = getArgV("-m");
const skipInteractive = argProjectType != null && argProjectType.length > 0;

if (!skipInteractive) {
process.stdout.write(`
select project type
- [c]  : cancel to start
- [cli]: command line interface application 
- [mod]: module
- [s-web] : static web application (react + etc.)
- [web]: dynamic web application (@bizhermit/nexpress + next + etc.)
- [dt] : desktop application (@bizhermit/nextron + next + etc.)
- [wd] : dynamic web and desktop application (@bizhermit/nexpress + @bizhermit/nextron + next + etc.)
`);
}

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

const inputLine = (props: { message: string; }) => {
    return new Promise<string>((resolve, reject) => {
        if (skipInteractive) {
            resolve(argProjectType);
            return;
        }
        process.stdout.write(props.message);
        process.stdin.resume().on("data", (data) => {
            process.stdin.pause();
            resolve(data.toString().trim());
        });
    });
};

inputLine({ message: `please input (default c) > `}).then(async (projectType) =>{
    try {
        switch (projectType) {
            case "cli":
                process.stdout.write(`\ncreate command line interface application...\n\n`);
                changeDir();
                await create_cli(dir);
                succeededProcess();
                break;
            case "mod":
                process.stdout.write(`\ncreate module...\n\n`);
                changeDir();
                await create_module(dir);
                succeededProcess();
                break;
            case "hp":
            case "s-web":
                process.stdout.write(`\ncreate static web (homepage)...\n\n`);
                changeDir();
                await create_staticWeb(dir);
                succeededProcess();
                break;
            case "web":
                process.stdout.write(`\ncreate dynamic web application...\n\n`);
                changeDir();
                await create_web(dir);
                succeededProcess();
                break;
            case "dt":
                process.stdout.write(`\ncreate desktop application...\n\n`);
                changeDir();
                await create_desktop(dir);
                succeededProcess();
                break;
            case "wd":
                process.stdout.write(`\ncreate dynamic web and desktop application...\n\n`);
                changeDir();
                await create_web_desktop(dir);
                succeededProcess();
                break;
            default:
                process.stdout.write(`\ncancel\n`);
                break;
        }
    } catch(err) {
        process.stderr.write(String(err));
        process.stdout.write(`\n${pkg.name} failed.\n`);
    }
    process.stdout.write(`${sepStr}\n`);
}).catch((err) => {
    process.stderr.write(err);
    process.stdout.write(`\n${pkg.name} failed.\n`);
    process.stdout.write(`${sepStr}\n`);
});