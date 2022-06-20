import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createCli = async (wdir: string) => {
    const pkg = await getPackageJson(wdir);
    pkg.main = "dist/index";
    pkg.bin = "bin/cli.js";
    pkg.scripts = {
        "clean": "npx rimraf bin dist",
        "build": "npm run clean && npx tsc -p src/tsconfig.json && npx rimraf bin/cli.d.ts",
        "try": "node bin/cli",
        "license-check": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "minify": "npx minifier bin && npx minifier dist",
        "test": "npx jest --roots test --json --outputFile=test/results.json",
        "release": "npm run license-check && npm run build && npm run minify && npm run test",
        "pack": "npx rimraf build && npm run release && npx pkg --out-path build --compress GZip bin/cli.js",
        "pack:win": "npm run pack -- --targets win",
        "pack:mac": "npm run pack -- --targets mac",
        "pack:linux": "npm run pack -- --targets linux"
    };
    pkg.files = ["bin", "dist", "CREDIT"];
    await savePackageJson(wdir, pkg);
    installLibs(wdir, [
        "@bizhermit/basic-utils",
        "@bizhermit/cli-sdk"
    ], [
        "@bizhermit/minifier",
        "@bizhermit/license",
        "@types/node",
        "jest",
        "pkg",
        "rimraf",
        "typescript"
    ]);
    await generateTemplate(wdir, "cli");
};
export default createCli;