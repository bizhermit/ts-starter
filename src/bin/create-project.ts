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

const getGit = (dir: string) => {
    return simpleGit({ baseDir: dir, binary: "git" });;
};

const moveItemToSrc = (dir: string, itemName: string) => {
    try {
        fse.moveSync(path.join(dir, itemName), path.join(dir, "src", itemName));
    } catch {
        process.stderr.write(`file or dir move failed: ${itemName}\n`);
    }
};
const cloneFiles = async (dir: string, url: string, func: (cloneDir: string) => Promise<void>) => {
    const cloneDir = path.join(dir, "_clone");
    await getGit(dir).clone(url, cloneDir);
    try {
        await func(cloneDir);
    } catch(err) {
        process.stderr.write(`clone process failed.\n`);
        process.stderr.write(String(err));
    }
    rimraf.sync(cloneDir);
};
const moveItemsCloneToDir = (dir: string, itemNames: Array<string>) => {
    for (const itemName of itemNames) {
        try {
            fse.moveSync(path.join(dir, "_clone", itemName), path.join(dir, itemName));
        } catch {
            process.stderr.write(`file or dir move failed: ${itemName}\n`);
        }
    }
}

export const create_homepage = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.scripts = {
        start: "npx react-scripts start",
        build: "npx rimraf build && npx react-scripts build && npx license-checker --production > build/LICENSE",
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-homepage.git", async () => {
        moveItemsCloneToDir(dir, [
            "src",
            "public",
            "tsconfig.json",
            "README.md",
            ".gitignore",
        ]);
    });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-cli-app.git", async () => {
        moveItemsCloneToDir(dir, [
            "src",
            "README.md",
            ".gitignore",
        ]);
    });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            "src",
            "src-server",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.web.md"), path.join(dir, "README.md"));
    });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            "src",
            "src-electron",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.desktop.md"), path.join(dir, "README.md"));
    });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            "src",
            "src-server",
            "src-electron",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.wd.md"), path.join(dir, "README.md"));
    });
};