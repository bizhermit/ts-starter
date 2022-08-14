#! /usr/bin/env node

import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import { getArg, getKeyArg, hasKeyArg, rl, wl } from "@bizhermit/cli-utils";
import { fillRight } from "@bizhermit/basic-utils/dist/string-utils";
import createCli from "../dist/create-cli";
import createModule from "../dist/create-module";
import createNextApp from "../dist/create-next-app";
import createReactNative from "../dist/create-react-native";

const sepStr = `::::::::::::::::::::::::::::::`;
const pkg = require("../package.json") as { [key: string]: any };

wl(sepStr)
wl(`\n${pkg.name} v${pkg.version}`);

const dir = path.join(process.cwd(), getArg() || "./");
wl(`  dirname: ${dir}`);

const argProjectType = getKeyArg("-t", "--type");
const skipInteractive = argProjectType != null && argProjectType.length > 0;

const appName = getKeyArg("--appName");
if (appName) wl(`  appName: ${appName}`);

const descriptions = {
  c  : `cancel`,
  mod: `module`,
  cli: `command line interface application`,
  fas: "frontend application server      [ \x1b[36mNext.js\x1b[39m ]",
  bas: "backend application server       [ \x1b[36mExpress\x1b[39m + \x1b[36mNext.js\x1b[39m ]",
  web: "web application server           [ \x1b[36mExpress\x1b[39m + \x1b[36mNext.js\x1b[39m ]",
  dsk: "desktop application              [ \x1b[36mElectron\x1b[39m + \x1b[36mNext.js\x1b[39m ]",
  app: "web & desktop application server [ \x1b[36mExpress\x1b[39m + \x1b[36mElectron\x1b[39m + \x1b[36mNext.js\x1b[39m ]",
  mob: `mobile application               [ \x1b[36mreact-native\x1b[39m ]`,
} as const;
const descriptionLine = (t: keyof typeof descriptions) => {
  return `- ${fillRight(`[\x1b[33m${t}\x1b[39m]`, 15, " ")}: ${descriptions[t]}`;
}

if (!skipInteractive) {
wl(`
\x1b[32mselect project type\x1b[39m
${descriptionLine("c")}
${descriptionLine("mod")}
${descriptionLine("cli")}
${descriptionLine("fas")}
${descriptionLine("bas")}
${descriptionLine("web")}
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

const succeededProcess = (t: keyof typeof descriptions) => {
  wl(`\nset up \x1b[42m succeeded \x1b[49m: \x1b[33m${t}\x1b[39m`);
  const cdDir = getArg();
  if (cdDir != null && process.cwd() !== dir) {
    wl(`\nstart with change directory`);
    wl(`  cd ${cdDir}`);
  }
};

const writeCreateDescription = (t: keyof typeof descriptions) => {
  wl(`create \x1b[33m${t}\x1b[39m: ${descriptions[t]}\n`);
};
const main = async (projectType: string) => {
  wl(" ");
  const opts = {
    appName
  };
  try {
    switch (projectType) {
      case "mod":
      case "module":
        writeCreateDescription("mod");
        changeDir();
        await createModule(dir, opts);
        succeededProcess("mod");
        break;
      case "cli":
        writeCreateDescription("cli");
        changeDir();
        await createCli(dir, opts);
        succeededProcess("cli");
        break;
      case "fas":
      case "gui":
      case "frontend":
        writeCreateDescription("fas");
        changeDir();
        await createNextApp(dir, "frontend", hasKeyArg("-s", "--separate"), opts);
        succeededProcess("fas");
        break;
      case "bas":
      case "api":
      case "backend":
        writeCreateDescription("bas");
        changeDir();
        await createNextApp(dir, "backend", hasKeyArg("-s", "--separate"), opts);
        succeededProcess("bas");
        break;
      case "web":
      case "nexpress":
        writeCreateDescription("web");
        changeDir();
        await createNextApp(dir, "web", hasKeyArg("-s", "--separate"), opts);
        succeededProcess("web");
        break;
      case "dsk":
      case "desktop":
      case "nextron":
        writeCreateDescription("dsk");
        changeDir();
        await createNextApp(dir, "desktop", hasKeyArg("-s", "--separate"), opts);
        succeededProcess("dsk");
        break;
      case "app":
      case "all":
      case "full":
        writeCreateDescription("app");
        changeDir();
        await createNextApp(dir, "all", hasKeyArg("-s", "--separate"), opts);
        succeededProcess("app");
        break;
      case "mob":
      case "mobile":
        writeCreateDescription("mob");
        changeDir();
        await createReactNative(dir, opts);
        succeededProcess("mob");
        break;
      default:
        wl(`cancel`);
        break;
    }
  } catch (err) {
    process.stderr.write(String(err));
    wl(`\nset up \x1b[41m failed \x1b[49m: ${projectType}`);
  }
  wl(`\n${sepStr}`);
};
if (skipInteractive) {
  main(argProjectType)
} else {
  rl(`please input (default \x1b[33mc\x1b[39m) > `).then(main).catch((err) => {
    process.stderr.write(err);
    wl(`${pkg.name} \x1b[41m failed \x1b[49m.`);
    wl(`\n${sepStr}`);
  });
}