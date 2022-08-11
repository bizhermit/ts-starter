#! /usr/bin/env node

import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import { getArg, getKeyArg, rl, wl } from "@bizhermit/cli-utils";
import { fillRight } from "@bizhermit/basic-utils/dist/string-utils";
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

const descriptions = {
  c  : `cancel`,
  mod: `module`,
  cli: `command line interface application`,
  stt: `static web page application (next.js - no SSR/SSG)`,
  nxp: `dynamic web page application (next.js + express)`,
  web: `web application (frontend: next.js + backend: express + next.js)`,
  api: `api server (express + next.js)`,
  dsk: `desktop application (electron + next.js)`,
  app: `web/desktop application (frontend: next.js + backend: express + next.js + desktop: electron)`,
  mob: `mobile application (react-native)`,
} as const;
const descriptionLine = (t: keyof typeof descriptions) => {
  return `- ${fillRight(`[${t}]`, 5)}: ${descriptions[t]}`;
}

if (!skipInteractive) {
wl(`
select project type
${descriptionLine("c")}
${descriptionLine("mod")}
${descriptionLine("cli")}
${descriptionLine("stt")}
${descriptionLine("nxp")}
${descriptionLine("web")}
${descriptionLine("api")}
${descriptionLine("dsk")}
${descriptionLine("app")}
${descriptionLine("mob")}`);
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

const writeCreateDescription = (t: keyof typeof descriptions) => {
  wl(`create ${descriptions[t]}`);
};
const main = async (projectType: string) => {
  wl(" ");
  try {
    switch (projectType) {
      case "mod":
      case "module":
        writeCreateDescription("mod");
        changeDir();
        await createModule(dir);
        succeededProcess(projectType);
        break;
      case "cli":
        writeCreateDescription("cli");
        changeDir();
        await createCli(dir);
        succeededProcess(projectType);
        break;
      case "stt":
        writeCreateDescription("stt");
        changeDir();
        await createNextApp(dir, "frontend");
        succeededProcess(projectType);
        break;
      case "nxp":
      case "nexpress":
        writeCreateDescription("nxp");
        changeDir();
        await createNextApp(dir, "next");
        succeededProcess(projectType);
        break;
      case "web":
        writeCreateDescription("web");
        changeDir();
        await createNextApp(dir, "f-b");
        break;
      case "api":
        writeCreateDescription("api");
        changeDir();
        await createNextApp(dir, "backend");
        break;
      case "dsk":
      case "desktop":
      case "nextron":
        writeCreateDescription("dsk");
        changeDir();
        await createNextApp(dir, "desktop");
        succeededProcess(projectType);
        break;
      case "app":
      case "all":
        writeCreateDescription("app");
        changeDir();
        await createNextApp(dir, "full");
        succeededProcess(projectType);
        break;
      case "mob":
      case "mobile":
        writeCreateDescription("mob");
        changeDir();
        await createReactNative(dir);
        succeededProcess(projectType);
        break;
      default:
        writeCreateDescription("c");
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