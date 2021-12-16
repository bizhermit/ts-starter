import path from "path";
import * as fse from "fs-extra";
import * as cp from "child_process";
import * as readline from "readline";

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

export const create_homepage = async (dir: string) => {
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

export const create_cli = async (dir: string) => {

};

export const create_web = async (dir: string) => {

};

export const create_desktop = async (dir: string) => {

};

export const create_web_desktop = async (dir: string) => {

};