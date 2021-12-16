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
const create_homepage = async (dir) => {
    const pkg = getPackageJson(dir);
    pkg.scripts = {
        "start": "npx react-scripts start",
        "build": "npx react-scripts build",
        "test": "npx react-scripts test",
        "eject": "npx react-scripts eject",
    };
    savePackageJson(dir, pkg);
    npmInstall(dir, [
        "react",
        "react-dom",
        "web-vitals",
    ], [
        "node-sass",
        "react-scripts",
        "typescript",
        "@types/node",
        "@types/react",
        "@types/react-dom",
    ]);
};
exports.create_homepage = create_homepage;
const create_cli = async (dir) => {
};
exports.create_cli = create_cli;
const create_web = async (dir) => {
};
exports.create_web = create_web;
const create_desktop = async (dir) => {
};
exports.create_desktop = create_desktop;
const create_web_desktop = async (dir) => {
};
exports.create_web_desktop = create_web_desktop;
