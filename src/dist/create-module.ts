import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createModule = async (wdir: string) => {
    const pkg = await getPackageJson(wdir);
    pkg.main = "dist/index";
    pkg.scripts = {
        "clean": "npx rimraf dist",
        "build": "npm run clean && npx tsc -p src/tsconfig.json",
        "debug": "node debug",
        "license-check": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "minify": "npx minifier dist",
        "test": "npx jest --roots test --json --outputFile=test/results.json",
        "release": "npm run license-check && npm run build && npm run minify && npm run test",
    };
    pkg.files = ["dist", "CREDIT"];
    await savePackageJson(wdir, pkg);
    installLibs(wdir, [
        "@bizhermit/basic-utils",
    ], [
        "@bizhermit/minifier",
        "@bizhermit/license",
        "@types/node",
        "jest",
        "rimraf",
        "typescript",
    ]);
    await generateTemplate(wdir, "module");
};
export default createModule;