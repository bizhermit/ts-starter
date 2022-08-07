import cli from "@bizhermit/cli-utils";
import { spawnSync } from "child_process";
import { copy, copyFile, existsSync, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";

const initializePackageContent = (pkg: { [key: string]: any }, values: Array<{ propertyName: string; initValue: any; }>) => {
  values.forEach(v => {
    pkg[v.propertyName] = pkg[v.propertyName] || v.initValue;
  });
  return pkg;
};

export const getPackageJson = async (wdir: string, options?: { clearScripts?: boolean; allowNotFoundNpmPackage?: boolean; }) => {
  const pkgPath = path.join(wdir, "package.json");
  if (!existsSync(pkgPath) && options?.allowNotFoundNpmPackage !== true) {
    cli.wl(`not found package.json. begin create`);
    await writeFile(pkgPath, "{}");
  }
  const pkgFile = await readFile(pkgPath);
  const pkg = JSON.parse(pkgFile.toString()) as { [key: string]: any };
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
    propertyName: "repository",
    initValue: { type: "git", url: "" },
  }, {
    propertyName: "bugs",
    initValue: { url: "" },
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
    propertyName: "scripts",
    initValue: {},
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

export const savePackageJson = async (wdir: string, pkg: { [key: string]: any }) => {
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

export const installLibs = (wdir: string, args: Array<string> = [], devArgs: Array<string> = [], options?: { audit?: boolean; }) => {
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
  if (options?.audit !== false) {
    spawnSync("npm", ["audit"], { shell: true, stdio: "inherit", cwd: wdir });
  }
};

export const generateTemplate = async (wdir: string, templateName: string) => {
  await copy(path.join(__dirname, "../template", templateName), wdir, { overwrite: true, recursive: true });
  await copyFile(path.join(__dirname, "../template/LICENSE"), path.join(wdir, "LICENSE"));
};

export const removeGit = (wdir: string) => {
  rimraf.sync(path.join(wdir, ".git"));
};

export const npmPackageInit = (wdir: string) => {
  spawnSync("npx", ["npm-package-utils", "init"], { shell: true, stdio: "inherit", cwd: wdir });
};

export const replaceAppName = async (filePath: string, appName: string) => {
  let targetFile = (await readFile(filePath)).toString();
  targetFile = targetFile.replace(/__appName__/g, appName);
  await writeFile(filePath, targetFile);
};

export const createEnv = async (wdir: string, lines: Array<string> = []) => {
  await writeFile(path.join(wdir, ".env"), lines.join("\n"));
};