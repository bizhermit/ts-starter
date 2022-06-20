import { spawnSync } from "child_process";
import { mkdir, move, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

const createNextApp = async (wdir: string, options?: { web?: boolean; desktop?: boolean; }) => {
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
    if (options?.web) {
        pkg.scripts = {
            ...pkg.scripts,
            "server": "npm run clean && npx tsc -p src-server/tsconfig.json && node main/index.js -dev",
            "build": "npm run license-check && npm run clean && npx tsc -p src-server/tsconfig.json && npx next build src",
            "start": "node main/index.js",
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
            "_pack": "npm run license-check && npm run clean && npx rimraf build && npx next build src && npx next export src && electron-builder --dir",
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
        devDeps.push("electron");
        devDeps.push("electron-builder");
    }
    await savePackageJson(wdir, pkg);
    installLibs(wdir, deps, devDeps);

    await generateTemplate(wdir, "next-app");

    if (options?.web) {
        const indexFilePath = path.join(wdir, "src-server", "index.ts");
        let indexFile = (await readFile(indexFilePath)).toString();
        indexFile = indexFile.replace(/__appName__/g, appName);
        await writeFile(indexFilePath, indexFile);
    }
    if (options?.desktop) {
        const indexFilePath = path.join(wdir, "src-desktop", "index.ts");
        let indexFile = (await readFile(indexFilePath)).toString();
        indexFile = indexFile.replace(/__appName__/g, appName);
        await writeFile(indexFilePath, indexFile);
    }
    if (!options?.web) {
        rimraf.sync(path.join(wdir, "src-server"));
    }
    if (!options?.desktop) {
        rimraf.sync(path.join(wdir, "src-desktop"));
    }
};
export default createNextApp;