import path from "path";
import { generateTemplate, getPackageJson, installLibs, npmPackageInit, replaceAppName, savePackageJson } from "./common";

const createCli = async (wdir: string) => {
  const pkg = await getPackageJson(wdir);
  pkg.scripts = {
    "clean": "npx rimraf package",
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
    "test": "npx jest --roots test --json --outputFile=test/results.json",
    "prebuild": "npm run license && npm run clean",
    "build": "npx tsc -p src/tsconfig.json && npx rimraf package/bin/cli.d.ts && npx minifier package",
    "postbuild": "npx npm-package-utils pack && npm run test",
    "build:exe": "npx rimraf build && npm run build && npx pkg --out-path build --compress GZip package/bin/cli.js",
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
  installLibs(path.join(wdir, "src"), [
    "@bizhermit/basic-utils",
    "@bizhermit/cli-utils"
  ], [
    "@types/node",
    "typescript"
  ]);
  await replaceAppName(path.join(wdir, "README.md"), pkg.name);
  installLibs(path.join(wdir, "stg"), [], [
    "@types/node",
    "typescript",
  ]);
};
export default createCli;