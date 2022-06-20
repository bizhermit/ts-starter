import cli from "@bizhermit/cli-sdk";
import { spawnSync } from "child_process";
import { copy, copyFile, existsSync, readFile, writeFile } from "fs-extra";
import path from "path";

const initializePackageContent = (pkg: {[key: string]: any}, values: Array<{ propertyName: string; initValue: any ;}>) => {
    values.forEach(v => {
        pkg[v.propertyName] = pkg[v.propertyName] || v.initValue;
    });
    return pkg;
};

export const getPackageJson = async (wdir: string, options?: { clearScripts?: boolean }) => {
    const pkgPath = path.join(wdir, "package.json");
    if (!existsSync(pkgPath)) {
        cli.wl(`not found package.json. begin create`);
        await writeFile(pkgPath, "{}");
    }
    const pkgFile = await readFile(pkgPath);
    const pkg = JSON.parse(pkgFile.toString()) as {[key: string]: any};
    initializePackageContent(pkg, [{
        propertyName: "name",
        initValue: path.basename(wdir),
    }, {
        propertyName: "version",
        initValue: "0.0.0-alpha.0",
    }, {
        propertyName: "description",
        initValue: "",
    }, {
        propertyName: "scripts",
        initValue: {},
    }, {
        propertyName: "repository",
        initValue: { type: "git", ulr: "" },
    }, {
        propertyName: "bugs",
        initValue: "",
    }, {
        propertyName: "author",
        initValue: "",
    }, {
        propertyName: "contributors",
        initValue: [],
    }, {
        propertyName: "private",
        initValue: true,
    }, {
        propertyName: "license",
        initValue: "MIT",
    }, {
        propertyName: "dependencies",
        initValue: {},
    }, {
        propertyName: "devDependencies",
        initValue: {},
    }]);
    if (options?.clearScripts) pkg.scripts = {};
    return pkg;
};

export const savePackageJson = async (wdir: string, pkg: {[key: string]: any}) => {
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
    await writeFile(path.join(wdir, "package.json"), JSON.stringify(expPkg, null, 2));
};

export const installLibs = (wdir: string, args: Array<string> = [], devArgs: Array<string> = []) => {
    cli.wl(`npm install...`);
    if (args.length > 0) {
        cli.wl(` install dependencies`);
        for (const arg of args) {
            cli.wl(`  - ${arg}`);
        }
        spawnSync("npm", ["i", "--legacy-peer-deps", ...args], { shell: true, stdio: "inherit", cwd: wdir });
    }
    if (devArgs.length > 0) {
        cli.wl(` install devDependencies`);
        for (const arg of devArgs) {
            cli.wl(`  - ${arg}`);
        }
        spawnSync("npm", ["i", "--save-dev", ...devArgs], { shell: true, stdio: "inherit", cwd: wdir });
    }
    spawnSync("npm", ["audit"], { shell: true, stdio: "inherit", cwd: wdir });
};

export const generateTemplate = async (wdir: string, templateName: string) => {
    await copy(path.join(__dirname, "../template", templateName), wdir, { overwrite: true, recursive: true });
    await copyFile(path.join(__dirname, "../template/LICENSE"), path.join(wdir, "LICENSE"));
    // await copyFile(path.join(__dirname, "../template/.gitignore"), path.join(wdir, ".gitignore"));
};