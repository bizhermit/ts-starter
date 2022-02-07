import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import * as rimraf from "rimraf";
import simpleGit from "simple-git";

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
    try {
        process.stdout.write(`clone ${url}.\n`);
        await getGit(dir).clone(url, cloneDir);
        await func(cloneDir);
        process.stdout.write(`clone succeeded.\n`);
    } catch (err) {
        process.stderr.write(`clone failed.\n`);
        process.stderr.write(String(err));
    } finally {
        rimraf.sync(cloneDir);
    }
};
const moveItemsCloneToDir = (dir: string, itemNames: Array<string>, overwrite?: boolean) => {
    for (const itemName of itemNames) {
        try {
            fse.moveSync(path.join(dir, "_clone", itemName), path.join(dir, itemName), { overwrite: overwrite ?? true });
        } catch {
            process.stderr.write(`file or dir move failed: ${itemName}\n`);
        }
    }
}

export const create_homepage = async (dir: string) => {
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-homepage.git", async () => {
        moveItemsCloneToDir(dir, [
            "src",
            "public",
            ".gitignore",
            "LICENSE",
            "README.md",
            "tsconfig.json",
        ]);
    });
};

export const create_cli = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.main = "dist/index";
    pkg.bin = "bin/cli";
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
    ], [
        `${bizhermitPrefix}/minifier`,
        `${bizhermitPrefix}/license`,
        "@types/node",
        "pkg",
        "rimraf",
        "typescript",
    ]);
    await cloneFiles(dir, "https://github.com/bizhermit/clone-cli-app.git", async () => {
        moveItemsCloneToDir(dir, [
            "src",
            "README.md",
            "LICENSE",
            ".gitignore",
        ]);
    });
};

export const create_module = async (dir: string) => {
    const pkg = getPackageJson(dir);
    pkg.main = "dist/index";
    pkg.scripts = {
        "dev": "node test",
        "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError",
        "build": "npm run license && npx rimraf dist && npx tsc -p src/tsconfig.json && npx rimraf bin/cli.d.ts && npx minifier dist",
        "pack": "npm run build && npx pkg --out-path build --compress GZip bin/cli.js",
        "pack:win": "npm run pack -- --targets win",
        "pack:mac": "npm run pack --targets mac",
        "pack:linux": "npm run pack --targets linux",
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-cli-app.git", async () => {
        moveItemsCloneToDir(dir, [
            "src",
            "README.md",
            "LICENSE",
            ".gitignore",
        ]);
    });
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

const moveItemsWhenNextApp = [
    "src/pages",
    "src/public",
    "src/styles",
    "src/i18n.json",
    "src/index.d.ts",
    "LICENSE",
];

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
        `${bizhermitPrefix}/license`,
        "@types/node",
        "rimraf",
    ]);
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            ...moveItemsWhenNextApp,
            "src-nexpress",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.web.md"), path.join(dir, "README.md"), { overwrite: true });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            ...moveItemsWhenNextApp,
            "src-nextron",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.desktop.md"), path.join(dir, "README.md"), { overwrite: true });
    });
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
    await cloneFiles(dir, "https://github.com/bizhermit/clone-next-app.git", async (cloneDir) => {
        moveItemsCloneToDir(dir, [
            ...moveItemsWhenNextApp,
            "src-nexpress",
            "src-nextron",
            ".gitignore",
        ]);
        fse.moveSync(path.join(cloneDir, "README.md"), path.join(dir, "README.md"), { overwrite: true });
    });
};