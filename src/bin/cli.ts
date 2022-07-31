#! /usr/bin/env node

import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import { getArg, getKeyArg, rl, wl } from "@bizhermit/cli-utils";
import createCli from "../dist/create-cli";
import createModule from "../dist/create-module";
import createNextApp from "../dist/create-next-app";
import createReactNative from "../dist/create-react-native";
import createReactApp from "../dist/create-react-app";

const sepStr = `::::::::::::::::::::::::::::::`;
const pkg = require("../package.json") as { [key: string]: any };

wl(sepStr)
wl(`\n${pkg.name} v${pkg.version}`);

const dir = path.join(process.cwd(), getArg() || "./");
wl(`  dirname: ${dir}`);

const argProjectType = getKeyArg("-t", "-type");
const skipInteractive = argProjectType != null && argProjectType.length > 0;

if (!skipInteractive) {
wl(`
select project type
- [c]  : cancel
- [mod]: module
- [cli]: command line interface application
- [spa]: web application (react)
- [web]: web application (next.js + express)
- [dsk]: desktop application (next.js + electron)
- [app]: web and desktop application (next.js + express / electron)
- [mob]: mobile application (react-native)`);
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
            case "mod":
            case "module":
                wl(`create module`);
                changeDir();
                await createModule(dir);
                succeededProcess(projectType);
                break;
            case "cli":
                wl(`create command line interface application`);
                changeDir();
                await createCli(dir);
                succeededProcess(projectType);
                break;
            case "spa":
            case "react":
                wl(`create web application (react)`);
                changeDir();
                await createReactApp(dir);
                succeededProcess(projectType);
                break;
            case "web":
            case "nexpress":
                wl(`create web application (next.js + express)`);
                changeDir();
                await createNextApp(dir, { server: true });
                succeededProcess(projectType);
                break;
            case "dsk":
            case "desktop":
            case "nextron":
                wl(`create desktop application (next.js + electron)`);
                changeDir();
                await createNextApp(dir, { desktop: true });
                succeededProcess(projectType);
                break;
            case "app":
            case "all":
                wl(`create web and desktop application (next.js + express / electron)`);
                changeDir();
                await createNextApp(dir, { server: true, desktop: true });
                succeededProcess(projectType);
                break;
            case "mob":
            case "mobile":
                wl(`create mobile application (react-native)`);
                changeDir();
                await createReactNative(dir);
                succeededProcess(projectType);
                break;
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