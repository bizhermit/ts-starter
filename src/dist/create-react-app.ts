import { readFile, writeFile } from "fs-extra";
import path from "path";
import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createReactApp = async (wdir: string) => {
    const appName = path.basename(wdir);

    const pkg = await getPackageJson(wdir);
    pkg.scripts = {
        "clean": "npx rimraf build",
        "start": "npx react-scripts start",
        "license-check": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "build": "npm run license-check && npm run clean && npx react-scripts build && npx cpx LICENSE build && npx cpx CREDIT build",
        "test": "npx react-scripts test",
        "eject": "npx react-scripts eject",
    };
    pkg.eslintConfig = {
        extends: ["react-app", "react-app/jest"]
    };
    pkg.browserslist = {
        production: [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        development: [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ],
    };
    await savePackageJson(wdir, pkg);

    installLibs(wdir, [
        "react",
        "react-dom",
        "react-router-dom",
        "styled-components",
        "web-vitals",
        `@bizhermit/react-sdk`,
        `@bizhermit/basic-utils`,
    ], [
        `@bizhermit/license`,
        "@types/node",
        "@types/react",
        "@types/react-dom",
        "@types/styled-components",
        "cpx",
        "node-sass",
        "react-scripts",
        "rimraf",
        "typescript",
    ]);
    await generateTemplate(wdir, "react-app");

    const replaceAppName = async (filePath: string) => {
        let targetFile = (await readFile(filePath)).toString();
        targetFile = targetFile.replace(/__appName__/g, appName);
        await writeFile(filePath, targetFile);
    }
    await replaceAppName(path.join(wdir, "public", "index.html"));
};
export default createReactApp;