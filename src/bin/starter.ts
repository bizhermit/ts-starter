#! /usr/bin/env node

import path from "path";
import { create_cli, create_desktop, create_homepage, create_web, create_web_desktop } from "./create-project";
import inputLine from "./input-line";
import * as fse from "fs-extra";
import * as cp from "child_process";

const sepStr = `\n::::::::::::::::::::::::::::::\n`;
const pkg = require("../package.json") as {[key: string]: any};

process.stdout.write(sepStr);
process.stdout.write(`\n${pkg.name} v${pkg.version}\n`);

const dir = path.join(process.cwd(), process.argv[2] || "./");
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
}
const succeededProcess = () => {
    process.stdout.write(`\n${pkg.name} succeeded.\n`);
    if (process.argv[2] != null && process.cwd() !== dir) {
        process.stdout.write(`\nstart with change directory`);
        process.stdout.write(`\n  cd ${process.argv[2]}\n`);
    }
}
inputLine({ message: `please input (default c) > `}).then(async (mode) =>{
    try {
        switch (mode) {
            case "hp":
                process.stdout.write(`\ncreate homepage...\n`);
                changeDir();
                await create_homepage(dir);
                succeededProcess();
                break;
            case "cli":
                process.stdout.write(`\ncreate command line interface application...\n`);
                changeDir();
                await create_cli(dir);
                succeededProcess();
                break;
            case "web":
                process.stdout.write(`\ncreate web application...\n`);
                changeDir();
                await create_web(dir);
                succeededProcess();
                break;
            case "dt":
                process.stdout.write(`\ncreate desktop application...\n`);
                changeDir();
                await create_desktop(dir);
                succeededProcess();
                break;
            case "wd":
                process.stdout.write(`\ncreate web and desktop application...\n`);
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