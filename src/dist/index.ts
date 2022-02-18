import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import * as rimraf from "rimraf";

const bizhermitPrefix = "@bizhermit";
type PackageJson = { [key: string]: any };

const getPackageJson = (cwd: string) => {
    let pkg: PackageJson = {};
    try {
        pkg = require(path.join(cwd, "package.json"));
    } catch {
        process.stdout.write(`create package.json\n`);
        fse.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(pkg, null, 2));
        pkg.dependencies = {};
        pkg.devDependencies = {};
    }
    pkg.name = pkg.name || path.basename(cwd);
    pkg.version = "0.0.0";
    pkg.description = "";
    pkg.scripts = {};
    pkg.repository = pkg.repository ?? { type: "git", ulr: "" };
    pkg.bugs = pkg.bugs || "";
    pkg.author = pkg.author || "";
    pkg.contributors = pkg.contributors ?? [];
    pkg.private = true;
    pkg.license = "MIT";
    return pkg;
};
const savePackageJson = (cwd: string, pkg: PackageJson) => {
    const expPkg: { [key: string]: any } = {};
    const keys = [
        "name",
        "version",
        "description",
        "repository",
        "bugs",
        "author",
        "homepage",
        "contributors",
        "license",
        "private",
        "main",
        "bin",
        "files",
        "scripts",
        "dependencies",
        "devDependencies",
        "build",
        "browser",
    ]
    for (const key of keys) {
        if (key in pkg) expPkg[key] = pkg[key];
    }
    Object.keys(pkg).forEach((key) => {
        if (key in expPkg) return;
        expPkg[key] = pkg[key];
    });
    fse.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(expPkg, null, 2));
};

const npmInstall = (cwd: string, args: Array<string> = [], devArgs: Array<string> = []) => {
    process.stdout.write(`npm install...\n`);
    if (args.length > 0) {
        process.stdout.write(`dependencies\n`);
        for (const arg of args) {
            process.stdout.write(` - ${arg}\n`);
        }
        cp.spawnSync("npm", ["i", "--legacy-peer-deps", ...args], { shell: true, stdio: "inherit", cwd });
    }
    if (devArgs.length > 0) {
        process.stdout.write(`devDependencies\n`);
        for (const arg of devArgs) {
            process.stdout.write(` - ${arg}\n`);
        }
        cp.spawnSync("npm", ["i", "--save-dev", ...devArgs], { shell: true, stdio: "inherit", cwd });
    }
    cp.spawnSync("npm", ["audit"], { shell: true, stdio: "inherit", cwd });;
};

const moveItemToSrc = (dir: string, itemName: string) => {
    try {
        fse.moveSync(path.join(dir, itemName), path.join(dir, "src", itemName));
    } catch {
        process.stderr.write(`file or dir move failed: ${itemName}\n`);
    }
};
const copyFromTemplate = async (dir: string, tempName: string, options?: { remove?: Array<string>; }) => {
    const tempPath = path.join(__dirname, "../template", tempName);
    await fse.copy(tempPath, dir, { overwrite: true, recursive: true });
    await fse.copyFile(path.join(__dirname, "../template/LICENSE"), path.join(dir, "LICENSE"));
    await fse.copyFile(path.join(dir, "gitignore"), path.join(dir, ".gitignore"));
    rimraf.sync(path.join(dir, "gitignore"));
    if (options) {
        options.remove?.forEach(v => rimraf.sync(path.join(dir, v)));
    }
};

const rename = async (dir: string, oldName: string, newName: string) => {
    const oldPath = path.join(dir, oldName);
    await fse.copyFile(oldPath, path.join(dir, newName));
    await fse.rm(oldPath);
};

export const create_staticWeb = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.scripts = {
        start: "npx react-scripts start",
        license: "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        build: "npm run license && npx rimraf build && npx react-scripts build && npx cpx LICENSE build && npx cpx CREDIT build",
        test: "npx react-scripts test",
        eject: "npx react-scripts eject",
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
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        "react",
        "react-dom",
        "react-router-dom",
        "styled-components",
        "web-vitals",
        `${bizhermitPrefix}/react-sdk`,
        `${bizhermitPrefix}/basic-utils`,
    ], [
        `${bizhermitPrefix}/license`,
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
    await copyFromTemplate(dir, "static-web");
};

export const create_cli = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.main = "dist/index";
    pkg.bin = "bin/cli.js";
    pkg.scripts = {
        "dev": "node bin/cli",
        "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "build": "npm run license && npx rimraf bin dist && npx tsc -p src/tsconfig.json && npx rimraf bin/cli.d.ts && npx minifier bin && npx minifier dist",
        "pack": "npm run build && npx pkg --out-path build --compress GZip bin/cli.js",
        "pack:win": "npm run pack -- --targets win",
        "pack:mac": "npm run pack --targets mac",
        "pack:linux": "npm run pack --targets linux",
        "prepare": "npm run build && git add -A && git diff --quiet --exit-code --cached || git commit -m \"build v%npm_package_version%\" && git push origin",
        "postpublish": "git tag && git push origin tags/v%npm_package_version%",
    };
    pkg.files = ["bin", "dist", "CREDIT"];
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        `${bizhermitPrefix}/basic-utils`,
        `${bizhermitPrefix}/cli-sdk`,
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "pkg",
        "rimraf",
        "typescript",
    ]);
    await copyFromTemplate(dir, "cli");
};

export const create_module = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.main = "dist/index";
    pkg.scripts = {
        "dev": "node test",
        "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "build": "npm run license && npx rimraf dist && npx tsc -p src/tsconfig.json && npx rimraf bin/cli.d.ts && npx minifier dist",
        "prepare": "npm run build && git add -A && git diff --quiet --exit-code --cached || git commit -m \"build v%npm_package_version%\" && git push origin",
        "postpublish": "git tag && git push origin tags/v%npm_package_version%",
    };
    pkg.files = ["dist", "CREDIT"];
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        `${bizhermitPrefix}/basic-utils`,
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "rimraf",
        "typescript",
    ]);
    await copyFromTemplate(dir, "module");
};

const rewriteTsconfig = (path: string) => {
    const tsconfig = require(path);
    tsconfig.compilerOptions.strictNullChecks = false;
    fse.writeFileSync(path, JSON.stringify(tsconfig, null, 2));
};

const create_nextApp = async (dir: string) => {
    cp.spawnSync("npx", ["create-next-app", "--ts", "."], { shell: true, stdio: "inherit", cwd: dir });
    fse.mkdirSync(path.join(dir, "src"));
    rimraf.sync(path.join(dir, "pages"));
    rimraf.sync(path.join(dir, "public"));
    rimraf.sync(path.join(dir, "styles"));
    moveItemToSrc(dir, "next-env.d.ts");
    moveItemToSrc(dir, "tsconfig.json");
    moveItemToSrc(dir, ".eslintrc.json");
    rewriteTsconfig(path.join(dir, "src/tsconfig.json"));
};

const packageJsonScripts_web = {
    "clean": "npx rimraf dist main src/.next src/out",
    "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError -exclude caniuse-lite",
    "prestart": "npm run clean && npx tsc -p src-nexpress/tsconfig.json",
    "server": "npm run prestart && node main/index.js -dev",
    "start": "npm run license && npx tsc -p src/tsconfig.json && npx next build src && npx minifier main && npx minifier src/.next && node main/index.js",
};
const packageJsonScripts_desktop = (name: string) => {
    return {
        "clean": "npx rimraf dist main src/.next src/out",
        "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError -exclude caniuse-lite",
        "prebuild": "npm run clean && npx tsc -p src-nextron/tsconfig.json",
        "electron": "npm run prebuild && npx electron main/src-nextron/index.js",
        "build:next": "npx next build src && npx next export src",
        "pack": "npm run prebuild && npx rimraf build && npm run build:next && npx minifier ./main && electron-builder --dir",
        "pack:win": "npm run pack -- --win",
        "confirm:win": `npm run pack:win && .\\build\\win-unpacked\\${name}.exe`,
        "confirm": "npm run confirm:win",
        "build": "npm run license && npx rimraf build && npm run build:next && npx tsc -p src-nextron/tsconfig.json && npx minifier ./main && electron-builder",
        "build:win": "npm run build -- --win",
    };
};
const packageJsonDesktopBuild = (name: string) => {
    return {
        appId: `example.${name}`,
        productName: name,
        asar: true,
        extends: null,
        extraMetadata: {
            main: "main/src-nextron/index.js"
        },
        files: ["main", "src/out"],
        extraFiles: [{
            from: "LICENSE",
            to: "LICENSE"
        }, {
            from: "CREDIT",
            to: "CREDIT"
        }, {
            from: "src/i18n.json",
            to: "resources/i18n.json"
        }],
        directories: {
            output: "build"
        },
        win: {
            icon: "src/public/favicon.ico",
            target: {
                target: "nsis",
                arch: ["x64"]
            }
        },
        mac: {},
        linux: {},
        nsis: {
            oneClick: false,
            allowToChangeInstallationDirectory: true
        }
    };
};

export const create_web = async (dir: string) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = packageJsonScripts_web;
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        `${bizhermitPrefix}/nexpress`,
        `${bizhermitPrefix}/next-absorber`,
        `${bizhermitPrefix}/react-sdk`,
        `${bizhermitPrefix}/basic-utils`,
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "rimraf",
    ]);
    await copyFromTemplate(dir, "next-app", { remove: ["src-nextron", "README.md", "README.desktop.md"] });
    await rename(dir, "README.web.md", "README.md");
};

export const create_desktop = async (dir: string) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = packageJsonScripts_desktop(path.basename(dir));
    pkg.build = packageJsonDesktopBuild(path.basename(dir));
    pkg.browser = {
        fs: false,
        path: false,
    };
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        `${bizhermitPrefix}/nextron`,
        `${bizhermitPrefix}/next-absorber`,
        `${bizhermitPrefix}/react-sdk`,
        `${bizhermitPrefix}/basic-utils`,
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "electron",
        "electron-builder",
        "rimraf",
    ]);
    await copyFromTemplate(dir, "next-app", { remove: ["src-nexpress", "README.md", "README.web.md"] });
    await rename(dir, "README.desktop.md", "README.md");
};

export const create_web_desktop = async (dir: string) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = { ...packageJsonScripts_web, ...packageJsonScripts_desktop(path.basename(dir)) };
    pkg.build = packageJsonDesktopBuild(path.basename(dir));
    pkg.browser = {
        fs: false,
        path: false,
    };
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        `${bizhermitPrefix}/nexpress`,
        `${bizhermitPrefix}/nextron`,
        `${bizhermitPrefix}/next-absorber`,
        `${bizhermitPrefix}/react-sdk`,
        `${bizhermitPrefix}/basic-utils`,
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "electron",
        "electron-builder",
        "rimraf",
    ]);
    await copyFromTemplate(dir, "next-app", { remove: ["README.web.md", "README.desktop.md"] });
};