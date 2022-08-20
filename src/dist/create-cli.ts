import path from "path";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, npmPackageInit, replaceAppName, replaceTexts, savePackageJson, __appName__ } from "./common";

const createCli = async (wdir: string, options?: ArgsOptions) => {
  const { appName } = analyzeArgsOptions(wdir, options);
  const __distDir__ = "__distDir__";
  const distDir = ".dist";
  const __srcDir__ = "__srcDir__";
  const srcDir = "src";
  const __stgDir__ = "__stgDir__";
  const stgDir = ".stg";
  const __packageDir__ = "__packageDir__";
  const packageDir = "package";

  const pkg = await getPackageJson(wdir, { appName, license: "MIT" });
  pkg.scripts = {
    "clean": `npx rimraf ${packageDir}`,
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
    "test": "npx jest --roots test --json --outputFile=test/results.json",
    "prebuild": "npm run license && npm run clean",
    "build": `npx tsc -p ${srcDir}/tsconfig.json && npx rimraf ${packageDir}/bin/cli.d.ts && npx minifier ${packageDir}`,
    "postbuild": "npx npm-package-utils pack && npm run test",
    "dist": `npx rimraf ${distDir} && npm run build && npx pkg --out-path ${distDir} --compress GZip ${packageDir}/bin/cli.js`,
    "dist:linux": "npm run build:exe -- --targets linux",
    "dist:win": "npm run build:exe -- --targets win",
    "dist:mac": "npm run build:exe -- --targets mac",
  };
  await savePackageJson(wdir, pkg);
  installLibs(wdir, [], [
    "@bizhermit/license",
    "@bizhermit/minifier",
    "@bizhermit/npm-package-utils",
    "jest",
    "pkg",
    "rimraf",
    "typescript",
  ]);
  await generateTemplate(wdir, "module");
  await generateTemplate(wdir, "cli");
  await replaceTexts(path.join(wdir, ".gitignore"), [
    { anchor: __srcDir__, text: srcDir },
    { anchor: __stgDir__, text: stgDir },
    { anchor: __distDir__, text: distDir },
  ]);
  await replaceTexts(path.join(wdir, srcDir, "tsconfig.json"), [
    { anchor: __stgDir__, text: stgDir },
    { anchor: __packageDir__, text: packageDir },
  ]);
  await replaceTexts(path.join(wdir, "test/test.js"), [
    { anchor: __packageDir__, text: packageDir },
  ]);

  npmPackageInit(wdir);
  const srcPkg = await getPackageJson(path.join(wdir, srcDir), { preventInit: true, ...options });
  await savePackageJson(path.join(wdir, srcDir), srcPkg);
  installLibs(path.join(wdir, srcDir), [
    "@bizhermit/basic-utils",
    "@bizhermit/cli-utils"
  ], [
    "@types/node",
    "typescript"
  ]);

  await replaceTexts(path.join(wdir, "README.md"), [
    { anchor: __appName__, text: appName },
    { anchor: __srcDir__, text: srcDir },
    { anchor: __stgDir__, text: stgDir },
  ]);

  await generateTemplate(wdir, "dev-env/module");
  await replaceTexts(path.join(wdir, ".vscode/tasks.json"), [
    { anchor: __srcDir__, text: srcDir },
    { anchor: __stgDir__, text: stgDir },
  ]);
  await replaceTexts(path.join(wdir, ".vscode/settings.json"), [
    { anchor: __srcDir__, text: srcDir },
    { anchor: __stgDir__, text: stgDir },
  ]);
  await replaceAppName(path.join(wdir, ".devcontainer/docker-compose.yml"), appName);
  await replaceTexts(path.join(wdir, ".devcontainer/devcontainer.json"), [
    { anchor: __appName__, text: appName },
    { anchor: __srcDir__, text: srcDir },
    { anchor: __stgDir__, text: stgDir },
  ]);
};
export default createCli;