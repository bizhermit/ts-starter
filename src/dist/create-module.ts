import path from "path";
import { generateTemplate, getPackageJson, installLibs, npmPackageInit, replaceAppName, savePackageJson } from "./common";

const createModule = async (wdir: string) => {
  const pkg = await getPackageJson(wdir);
  pkg.main = "dist/index";
  pkg.scripts = {
    "dev": "echo change directory to dev",
    "clean": "npx rimraf package",
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
    "test": "npx jest --roots test --json --outputFile=test/results.json",
    "prebuild": "npm run license && npm run clean",
    "build": "npx tsc -p src/tsconfig.json && npx minifier package",
    "postbuild": "npx npm-package-utils pack && npm run test",
  };
  await savePackageJson(wdir, pkg);
  installLibs(wdir, [], [
    "@bizhermit/license",
    "@bizhermit/minifier",
    "@bizhermit/npm-package-utils",
    "jest",
    "rimraf",
    "typescript",
  ]);
  await generateTemplate(wdir, "module");
  npmPackageInit(wdir);
  installLibs(path.join(wdir, "src"), [
    "@bizhermit/basic-utils",
  ], [
    "@types/node",
    "typescript",
  ]);
  await replaceAppName(path.join(wdir, "README.md"), pkg.name);
  installLibs(path.join(wdir, "stg"), [], [
    "@types/node",
    "typescript",
  ]);
};
export default createModule;