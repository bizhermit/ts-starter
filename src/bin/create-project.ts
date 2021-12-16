import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import * as rimraf from "rimraf";
import simpleGit from "simple-git";

type PackageJson = {[key: string]: any};

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
    const expPkg: {[key: string]: any}  = {};
    const keys = [
        "name",
        "version",
        "description",
        "main",
        "bin",
        "repository",
        "bugs",
        "author",
        "contributors",
        "license",
        "private",
        "scripts",
        "dependencies",
        "devDependencies",
        "files",
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

const getGit = (dir: string) => {
    return simpleGit({ baseDir: dir, binary: "git" });;
};

const moveItem = (dir: string, itemName: string) => {
    try {
        fse.moveSync(path.join(dir, itemName), path.join(dir, "src", itemName));
    } catch {}
};

export const create_homepage = async (dir: string) => {
    fse.mkdirSync(path.join(dir, "src"))
    const pkg = getPackageJson(dir);
    pkg.scripts = {
        start: "npx react-scripts start",
        build: "npx rimraf build && npx react-scripts build && npx license-checker --production > build/LICENSE",
        test: "npx react-scripts test",
        eject: "npx react-scripts eject",
    };
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        "react",
        "react-dom",
        "web-vitals",
    ], [
        "@types/node",
        "@types/react",
        "@types/react-dom",
        "license-checker",
        "node-sass",
        "react-scripts",
        "rimraf",
        "typescript",
    ]);
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-homepage.git", cloneDir);
    fse.moveSync(path.join(cloneDir, "src"), path.join(dir, "src"));
    fse.moveSync(path.join(cloneDir, "public"), path.join(dir, "public"));
    fse.moveSync(path.join(cloneDir, "README.md"), path.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};

export const create_cli = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.main = "bin/cli.js";
    pkg.bin = "bin/cli.js";
    pkg.scripts = {
        dev: "npx tsc -w -p src",
        build: "npx tsc -p src && npx license-checker --production > build/LICENSE",
        pack: "npx rimraf build && npm run build && npx pkg --out-path build --compress GZip bin/cli.js",
    };
    pkg.files = ["bin"];
    savePackageJson(dir, pkg);
    npmInstall(dir, [], [
        "@types/node",
        "license-checker",
        "pkg",
        "typescript",
        "rimraf",
    ]);
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-cli-app.git", cloneDir);
    fse.moveSync(path.join(cloneDir, "src"), path.join(dir, "src"));
    fse.moveSync(path.join(cloneDir, "README.md"), path.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};

const create_nextApp = async (dir: string) => {
    cp.spawnSync("npx", ["create-next-app", "--ts", "."], { shell: true, stdio: "inherit", cwd: dir });
    fse.mkdirSync(path.join(dir, "src"));
    rimraf.sync(path.join(dir, "pages"));
    rimraf.sync(path.join(dir, "public"));
    rimraf.sync(path.join(dir, "styles"));
    moveItem(dir, "next-env.d.ts");
    moveItem(dir, "tsconfig.json");
    moveItem(dir, ".eslintrc.json");
};

const packageJsonScripts_web = {
    server: "npx tsc -p src-server && node main/index.js -dev",
    start: "npx tsc -p src-server && npx tsc -p src && npx next build src && node main/index.js",
};
const packageJsonScripts_desktop = (name: string) => {
    return {
        electron: "npx tsc -p src-electron && npx electron main/src-electron/index.js",
        "pack:win": "npx rimraf build && npm run license && npx next build src && npx next export src && npx tsc -p src-electron && electron-builder --win --dir",
        pack: "npm run pack:win",
        "confirm:win": `npm run pack:win && .\\build\\win-unpacked\\${name}.exe`,
        confirm: "npm run confirm:win",
        "build:win": "npx rimraf build && npm run license && npx next build src && npx next export src && npx tsc -p src-electron && electron-builder --win",
        build: "npm run build:win",
    };
};
const packageJsonDesktopBuild = (name: string) => {
    return {
        appId: `com.seekones.${name}`,
        productName: name,
        asar: true,
        extends: null,
        extraMetadata: {
            main: "main/src-electron/index.js"
        },
        files: ["main", "src/out"],
        extraFiles: [{
            from: "LICENSE",
            to: "LICENSE"
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
    npmInstall(dir, [], [
        "@types/node",
        "license-checker",
        "rimraf",
    ]);
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path.join(cloneDir, "src"), path.join(dir, "src"));
    fse.moveSync(path.join(cloneDir, "src-server"), path.join(dir, "src-server"));
    fse.moveSync(path.join(cloneDir, "README.web.md"), path.join(dir, "README.md"));
    rimraf.sync(cloneDir);
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
    npmInstall(dir, [], [
        "@types/node",
        "electron",
        "electron-builder",
        "license-checker",
        "rimraf",
    ]);
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path.join(cloneDir, "src"), path.join(dir, "src"));
    fse.moveSync(path.join(cloneDir, "src-electron"), path.join(dir, "src-electron"));
    fse.moveSync(path.join(cloneDir, "README.desktop.md"), path.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};

export const create_web_desktop = async (dir: string) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = {...packageJsonScripts_web, ...packageJsonScripts_desktop(path.basename(dir))};
    pkg.build = packageJsonDesktopBuild(path.basename(dir));
    pkg.browser = {
        fs: false,
        path: false,
    };
    savePackageJson(dir, pkg);
    npmInstall(dir, [], [
        "@types/node",
        "electron",
        "electron-builder",
        "license-checker",
        "rimraf",
    ]);
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path.join(cloneDir, "src"), path.join(dir, "src"));
    fse.moveSync(path.join(cloneDir, "src-server"), path.join(dir, "src-server"));
    fse.moveSync(path.join(cloneDir, "src-electron"), path.join(dir, "src-electron"));
    fse.moveSync(path.join(cloneDir, "README.wd.md"), path.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};