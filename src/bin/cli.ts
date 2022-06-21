#! /usr/bin/env node

import path from "path";
import { create_staticWeb, create_mobile } from "../dist";
import * as fse from "fs-extra";
import * as cp from "child_process";
import { getArg, getKeyArg, rl, wl } from "@bizhermit/cli-sdk";
import createCli from "../dist/create-cli";
import createModule from "../dist/create-module";
import createNextApp from "../dist/create-next-app";

const sepStr = `::::::::::::::::::::::::::::::`;
const pkg = require("../package.json") as { [key: string]: any };

wl(sepStr)
wl(`\n${pkg.name} v${pkg.version}`);

const dir = path.join(process.cwd(), getArg() || "./");
wl(`  dirname: ${dir}`);

const argProjectType = getKeyArg("-m");
const skipInteractive = argProjectType != null && argProjectType.length > 0;

if (!skipInteractive) {
wl(`
select project type
- [c]  : cancel to start
- [cli]: command line interface application 
- [mod]: module
- [s-web] : static web application (react + etc.)
- [web]: dynamic web application (@bizhermit/nexpress + next + etc.)
- [dt] : desktop application (@bizhermit/nextron + next + etc.)
- [wd] : dynamic web and desktop application (@bizhermit/nexpress + @bizhermit/nextron + next + etc.)
- [mob]: mobile application (react-native + etc.)`);
}

const changeDir = () => {
    if (!fse.existsSync(dir)) {
        wl(`create dir : ${dir}`);
        fse.mkdirSync(dir, { recursive: true });
    }
    cp.spawnSync("cd", [dir], { shell: true, stdio: "inherit", cwd: process.cwd() });
};

const succeededProcess = (projectType: string) => {
    wl(`\nset up succeeded: ${projectType}`);
    const cdDir = getArg();
    if (cdDir != null && process.cwd() !== dir) {
        wl(`start with change directory`);
        wl(`  cd ${cdDir}`);
    }
};

const main = async (projectType: string) => {
    wl(" ");
    try {
        switch (projectType) {
            case "cli":
                wl(`create command line interface application...`);
                changeDir();
                await createCli(dir);
                succeededProcess(projectType);
                break;
            case "mod":
                wl(`create module...`);
                changeDir();
                await createModule(dir);
                succeededProcess(projectType);
                break;
            case "hp":
            case "s-web":
                wl(`create static web (homepage)...`);
                changeDir();
                await create_staticWeb(dir);
                succeededProcess(projectType);
                break;
            case "web":
                wl(`create dynamic web application...`);
                changeDir();
                await createNextApp(dir, { server: true });
                succeededProcess(projectType);
                break;
            case "dt":
                wl(`create desktop application...`);
                changeDir();
                await createNextApp(dir, { desktop: true });
                succeededProcess(projectType);
                break;
            case "wd":
                wl(`create dynamic web and desktop application...`);
                changeDir();
                await createNextApp(dir, { server: true, desktop: true });
                succeededProcess(projectType);
                break;
            case "mob":
                wl(`create mobile application...`);
                changeDir();
                await create_mobile(dir);
                succeededProcess(projectType);
                break;
            case "all":
            default:
                wl(`cancel`);
                break;
        }
    } catch (err) {
        process.stderr.write(String(err));
        wl(`\nset up failed: ${projectType}`);
    }
    wl(`\n${sepStr}`);
};
if (skipInteractive) {
    main(argProjectType)
} else {
    rl(`please input (default c) > `).then(main).catch((err) => {
        process.stderr.write(err);
        wl(`${pkg.name} failed.`);
        wl(`\n${sepStr}`);
    });
}