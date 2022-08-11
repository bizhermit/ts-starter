import path from "path";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, npmPackageInit, replaceAppName, savePackageJson } from "./common";

const createCli = async (wdir: string, options?: ArgsOptions) => {
  const { appName } = analyzeArgsOptions(wdir, options);
  const pkg = await getPackageJson(wdir, options);
  pkg.name = appName;
  pkg.scripts = {
    "clean": "npx rimraf package",
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
    "test": "npx jest --roots test --json --outputFile=test/results.json",
    "prebuild": "npm run license && npm run clean",
    "build": "npx tsc -p src/tsconfig.json && npx rimraf package/bin/cli.d.ts && npx minifier package",
    "postbuild": "npx npm-package-utils pack && npm run test",
    "build:exe": "npx rimraf .build && npm run build && npx pkg --out-path .build --compress GZip package/bin/cli.js",
    "build:linux": "npm run build:exe -- --targets linux",
    "build:win": "npm run build:exe -- --targets win",
    "build:mac": "npm run build:exe -- --targets mac",
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
  await generateTemplate(wdir, "cli");
  npmPackageInit(wdir);
  const srcPkg = await getPackageJson(path.join(wdir, "src"), { preventInit: true });
  srcPkg.name = appName;
  await savePackageJson(path.join(wdir, "src"), srcPkg);
  installLibs(path.join(wdir, "src"), [
    "@bizhermit/basic-utils",
    "@bizhermit/cli-utils"
  ], [
    "@types/node",
    "typescript"
  ]);
  const stgPkg = await getPackageJson(path.join(wdir, "src/.stg"), { preventInit: true });
  stgPkg.name = appName;
  stgPkg.scripts = {
    "clean": "npx rimraf bin dist",
    "prebuild": "npm run clean",
    "build": "npx tsc -p tsconfig.src.json && npx tsc -p tsconfig.json",
    "cli": "node bin/cli",
    "js": "node js-index",
    "ts": "node ts-index"
  };
  await savePackageJson(path.join(wdir, "src/.stg"), stgPkg);

  await generateTemplate(wdir, "dev-env/module");

  await replaceAppName(path.join(wdir, "README.md"), appName);
  await replaceAppName(path.join(wdir, ".devcontainer/docker-compose.yml"), appName);
  await replaceAppName(path.join(wdir, ".devcontainer/devcontainer.json"), appName);
};
export default createCli;