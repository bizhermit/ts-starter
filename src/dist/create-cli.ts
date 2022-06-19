import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createCli = async (wdir: string) => {
    const pkg = await getPackageJson(wdir);
    pkg.main = "dist/index";
    pkg.bin = "bin/cli.js";
    pkg.scripts = {
        "try": "node bin/cli",
        "test": "node test",
        "license-check": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "clean": "npx rimraf bin dist",
        "build": "npm run clean && npx tsc -p src/tsconfig.json && npx rimraf bin/cli.d.ts",
        "minify": "npx minifier bin && npx minifier dist",
        "pack": "npm run build && npx pkg --out-path build --compress GZip bin/cli.js",
        "pack:win": "npm run pack -- --targets win",
        "pack:mac": "npm run pack -- --targets mac",
        "pack:linux": "npm run pack -- --targets linux",
    };
    pkg.files = ["bin", "dist", "CREDIT"];
    savePackageJson(wdir, pkg);
    installLibs(wdir, [
        "@bizhermit/basic-utils",
        "@bizhermit/cli-sdk",
    ], [
        "@bizhermit/minifier",
        "@bizhermit/license",
        "@types/node",
        "pkg",
        "rimraf",
        "typescript",
    ]);
    await generateTemplate(wdir, "cli");
};
export default createCli;