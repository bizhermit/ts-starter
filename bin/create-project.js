"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_web_desktop = exports.create_desktop = exports.create_web = exports.create_cli = exports.create_homepage = void 0;
const path_1 = __importDefault(require("path"));
const fse = __importStar(require("fs-extra"));
const cp = __importStar(require("child_process"));
const rimraf = __importStar(require("rimraf"));
const simple_git_1 = __importDefault(require("simple-git"));
const getPackageJson = (cwd) => {
    let pkg = {};
    try {
        pkg = require(path_1.default.join(cwd, "package.json"));
    }
    catch {
        process.stdout.write(`create package.json\n`);
        fse.writeFileSync(path_1.default.join(cwd, "package.json"), JSON.stringify(pkg, null, 2));
        pkg.dependencies = {};
        pkg.devDependencies = {};
    }
    pkg.name = pkg.name || path_1.default.basename(cwd);
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
const savePackageJson = (cwd, pkg) => {
    const expPkg = {};
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
    ];
    for (const key of keys) {
        if (key in pkg)
            expPkg[key] = pkg[key];
    }
    Object.keys(pkg).forEach((key) => {
        if (key in expPkg)
            return;
        expPkg[key] = pkg[key];
    });
    fse.writeFileSync(path_1.default.join(cwd, "package.json"), JSON.stringify(expPkg, null, 2));
};
const npmInstall = (cwd, args = [], devArgs = []) => {
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
    cp.spawnSync("npm", ["audit"], { shell: true, stdio: "inherit", cwd });
    ;
};
const getGit = (dir) => {
    return (0, simple_git_1.default)({ baseDir: dir, binary: "git" });
    ;
};
const moveItem = (dir, itemName) => {
    try {
        fse.moveSync(path_1.default.join(dir, itemName), path_1.default.join(dir, "src", itemName));
    }
    catch { }
};
const create_homepage = async (dir) => {
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
    const cloneDir = path_1.default.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-homepage.git", cloneDir);
    fse.moveSync(path_1.default.join(cloneDir, "src"), path_1.default.join(dir, "src"));
    fse.moveSync(path_1.default.join(cloneDir, "public"), path_1.default.join(dir, "public"));
    fse.moveSync(path_1.default.join(cloneDir, "tsconfig.json"), path_1.default.join(dir, "tsconfig.json"));
    fse.moveSync(path_1.default.join(cloneDir, "README.md"), path_1.default.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};
exports.create_homepage = create_homepage;
const create_cli = async (dir) => {
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
    const cloneDir = path_1.default.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-cli-app.git", cloneDir);
    fse.moveSync(path_1.default.join(cloneDir, "src"), path_1.default.join(dir, "src"));
    fse.moveSync(path_1.default.join(cloneDir, "README.md"), path_1.default.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};
exports.create_cli = create_cli;
const create_nextApp = async (dir) => {
    cp.spawnSync("npx", ["create-next-app", "--ts", "."], { shell: true, stdio: "inherit", cwd: dir });
    fse.mkdirSync(path_1.default.join(dir, "src"));
    rimraf.sync(path_1.default.join(dir, "pages"));
    rimraf.sync(path_1.default.join(dir, "public"));
    rimraf.sync(path_1.default.join(dir, "styles"));
    moveItem(dir, "next-env.d.ts");
    moveItem(dir, "tsconfig.json");
    moveItem(dir, ".eslintrc.json");
};
const packageJsonScripts_web = {
    server: "npx tsc -p src-server && node main/index.js -dev",
    start: "npx tsc -p src-server && npx tsc -p src && npx next build src && node main/index.js",
};
const packageJsonScripts_desktop = (name) => {
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
const packageJsonDesktopBuild = (name) => {
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
const create_web = async (dir) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = packageJsonScripts_web;
    savePackageJson(dir, pkg);
    npmInstall(dir, [], [
        "@types/node",
        "license-checker",
        "rimraf",
    ]);
    const cloneDir = path_1.default.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path_1.default.join(cloneDir, "src"), path_1.default.join(dir, "src"));
    fse.moveSync(path_1.default.join(cloneDir, "src-server"), path_1.default.join(dir, "src-server"));
    fse.moveSync(path_1.default.join(cloneDir, "README.web.md"), path_1.default.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};
exports.create_web = create_web;
const create_desktop = async (dir) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = packageJsonScripts_desktop(path_1.default.basename(dir));
    pkg.build = packageJsonDesktopBuild(path_1.default.basename(dir));
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
    const cloneDir = path_1.default.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path_1.default.join(cloneDir, "src"), path_1.default.join(dir, "src"));
    fse.moveSync(path_1.default.join(cloneDir, "src-electron"), path_1.default.join(dir, "src-electron"));
    fse.moveSync(path_1.default.join(cloneDir, "README.desktop.md"), path_1.default.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};
exports.create_desktop = create_desktop;
const create_web_desktop = async (dir) => {
    create_nextApp(dir);
    const pkg = getPackageJson(dir);
    pkg.scripts = { ...packageJsonScripts_web, ...packageJsonScripts_desktop(path_1.default.basename(dir)) };
    pkg.build = packageJsonDesktopBuild(path_1.default.basename(dir));
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
    const cloneDir = path_1.default.join(dir, "_clone");
    await getGit(dir).clone("https://github.com/bizhermit/clone-next-app.git", cloneDir);
    fse.moveSync(path_1.default.join(cloneDir, "src"), path_1.default.join(dir, "src"));
    fse.moveSync(path_1.default.join(cloneDir, "src-server"), path_1.default.join(dir, "src-server"));
    fse.moveSync(path_1.default.join(cloneDir, "src-electron"), path_1.default.join(dir, "src-electron"));
    fse.moveSync(path_1.default.join(cloneDir, "README.wd.md"), path_1.default.join(dir, "README.md"));
    rimraf.sync(cloneDir);
};
exports.create_web_desktop = create_web_desktop;
