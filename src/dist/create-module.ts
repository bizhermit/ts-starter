import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createModule = async (wdir: string) => {
  const pkg = await getPackageJson(wdir);
  pkg.main = "dist/index";
  pkg.scripts = {
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
    "build": "npm run license && npx rimraf package && npx tsc -p src/tsconfig.json && npx minifier package && npx npm-package-utils pack"
  };
  pkg.files = ["dist", "CREDIT"];
  await savePackageJson(wdir, pkg);
  installLibs(wdir, [
    "@bizhermit/basic-utils",
  ], [
    "@bizhermit/license",
    "@bizhermit/minifier",
    "@bizhermit/npm-package-utils",
    "@types/node",
    "jest",
    "rimraf",
    "typescript",
  ]);
  await generateTemplate(wdir, "module");
};
export default createModule;