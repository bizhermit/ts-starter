import { spawnSync } from "child_process";
import { mkdir, move, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createNextApp = async (wdir: string, options?: { server?: boolean; desktop?: boolean; }) => {
    const appName = path.basename(wdir);

    spawnSync("npx", ["create-next-app", "--ts", "."], { shell: true, stdio: "inherit", cwd: wdir });
    await mkdir(path.join(wdir, "src"));
    rimraf.sync(path.join(wdir, "pages"));
    rimraf.sync(path.join(wdir, "public"));
    rimraf.sync(path.join(wdir, "styles"));
    await move(path.join(wdir, ".eslintrc.json"), path.join(wdir, "src", ".eslintrc.json"));
    await move(path.join(wdir, "next-env.d.ts"), path.join(wdir, "src", "next-env.d.ts"));
    await move(path.join(wdir, "tsconfig.json"), path.join(wdir, "src", "tsconfig.json"));

    const gitignorePath = path.join(wdir, ".gitignore");
    let gitignoreContent = (await readFile(gitignorePath)).toString();
    gitignoreContent = gitignoreContent
        .replace("/.next/", "/src/.next/")
        .replace("/out/", "/src/out/");
    gitignoreContent += `\n# @bzihermit/starter`;
    const addGitignoreContents = (lines: Array<string>) => {
        lines.forEach(line => {
            gitignoreContent += `\n${line}`;
        });
    }
    addGitignoreContents(["/.vscode", "/main"]);
    if (options?.desktop) {
        addGitignoreContents(["/resources/config.json"]);
    }
    await writeFile(gitignorePath, gitignoreContent);

    const deps = [
        "@bizhermit/react-sdk",
        "@bizhermit/basic-utils",
    ];
    const devDeps = [
        "@bizhermit/license",
        "@bizhermit/minifier",
        "@types/node",
        "rimraf",
    ];

    const pkg = await getPackageJson(wdir, { clearScripts: true });
    pkg.version = "0.0.0-alpha.0";
    pkg.scripts = {
        "clean": "npx rimraf main src/.next src/out",
        "license-check": "npx rimraf CREDIT && npx license -o CREDIT --returnError -exclude caniuse-lite",
        "test": "npx next lint src",
    };
    if (options?.server) {
        pkg.scripts = {
            ...pkg.scripts,
            "server": "npm run clean && npx tsc -p src-server/tsconfig.json && node main/src-server/index.js -dev",
            "build": "npm run license-check && npm run clean && npx tsc -p src-server/tsconfig.json && npx minifier main && npx next build src",
            "start": "node main/src-server/index.js",
        };
        deps.push("express");
        deps.push("express-session");
        deps.push("helmet");
        devDeps.push("@types/express");
        devDeps.push("@types/express-session");
    }
    if (options?.desktop) {
        pkg.scripts = {
            ...pkg.scripts,
            "desktop": "npm run clean && npx tsc -p src-desktop/tsconfig.json && npx electron main/src-desktop/index.js",
            "_pack": `npm run license-check && npm run clean && npx rimraf build && npx tsc -p src-desktop/tsconfig.json && npx minifier main ${!options?.server ? "" : "&& set APP_BASE_PATH= "}&& npx next build src && npx next export src && electron-builder --dir`,
            "pack:win": "npm run _pack -- --win",
        };
        pkg.build = {
            "appId": `example.${appName}`,
            "productName": appName,
            "asar": true,
            "extends": null,
            "extraMetadata": {
                "main": "main/src-desktop/index.js"
            },
            "files": ["main", "src/out", "src/public"],
            "extraFiles": [{
                "from": "LICENSE",
                "to": "LICENSE",
            }, {
                "from": "CREDIT",
                "to": "CREDIT",
            }],
            "directories": {
                "output": "build",
            },
            "win": {
                "icon": "src/public/favicon.ico",
                "target": {
                    "target": "nsis",
                    "arch": ["x64"],
                },
            },
            "mac": {},
            "linux": {},
            "nsis": {
                "oneClick": false,
                "allowToChangeInstallationDirectory": true,
            },
        };
        pkg.browser = {
            fs: false,
            path: false,
        };
        deps.push("electron-is-dev");
        deps.push("electron-next");
        deps.push("fs-extra");
        devDeps.push("electron");
        devDeps.push("electron-builder");
        devDeps.push("@types/fs-extra");
    }
    await savePackageJson(wdir, pkg);
    installLibs(wdir, deps, devDeps);

    await generateTemplate(wdir, "next-app");

    const replaceAppName = async (filePath: string) => {
        let targetFile = (await readFile(filePath)).toString();
        targetFile = targetFile.replace(/__appName__/g, appName);
        await writeFile(filePath, targetFile);
    }
    await replaceAppName(path.join(wdir, "next.config.js"));
    if (options?.server) {
        await replaceAppName(path.join(wdir, "src-server", "index.ts"));
    }
    if (options?.desktop) {
        await replaceAppName(path.join(wdir, "src-desktop", "index.ts"));
    }
    if (!options?.server) {
        await generateTemplate(wdir, "next-app-desktop");
        rimraf.sync(path.join(wdir, "src-server"));
    }
    if (!options?.desktop) {
        await generateTemplate(wdir, "next-app-server");
        rimraf.sync(path.join(wdir, "src-desktop"));
        rimraf.sync(path.join(wdir, "src/modules/electron-accessor.ts"));
        rimraf.sync(path.join(wdir, "src/modules/frontend/use-electron.ts"));

    }
};
export default createNextApp;