import cli from "@bizhermit/cli-utils";
import { spawnSync } from "child_process";
import { copy, copyFile, existsSync, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";

export type ArgsOptions = {
  appName?: string;
};

export const analyzeArgsOptions = (wdir: string, options?: ArgsOptions) => {
  const appName = options?.appName || path.basename(wdir);
  let platform = "";
  switch (process.platform) {
    case "win32":
      platform = "win";
      break;
    case "darwin":
      platform = "mac";
      break;
    default:
      platform = "linux";
      break;
  };
  return {
    appName: appName.replace(/ /g, "_").replace(/:/g, "-"),
    platform,
  };
};

const initializePackageContent = (pkg: { [key: string]: any }, values: Array<{ propertyName: string; initValue: any; }>) => {
  values.forEach(v => {
    pkg[v.propertyName] = pkg[v.propertyName] || v.initValue;
  });
  return pkg;
};

export const getPackageJson = async (wdir: string, options?: { preventInit?: boolean; clearScripts?: boolean; allowNotFoundNpmPackage?: boolean; license?: "MIT"; } & ArgsOptions) => {
  const pkgPath = path.join(wdir, "package.json");
  const { appName } = analyzeArgsOptions(wdir, options);
  if (!existsSync(pkgPath) && options?.allowNotFoundNpmPackage !== true) {
    cli.wl(`not found package.json. begin create`);
    await writeFile(pkgPath, "{}");
  }
  const pkgFile = await readFile(pkgPath);
  const pkg = JSON.parse(pkgFile.toString()) as { [key: string]: any };
  if (options?.preventInit !== true) {
    initializePackageContent(pkg, [{
      propertyName: "name",
      initValue: appName,
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
      propertyName: "scripts",
      initValue: {},
    }, {
      propertyName: "dependencies",
      initValue: {},
    }, {
      propertyName: "devDependencies",
      initValue: {},
    }]);
    if (options?.license) {
      initializePackageContent(pkg, [{
        propertyName: "license",
        initValue: "MIT",
      }]);
      await copyFile(path.join(__dirname, "../template/LICENSE"), path.join(wdir, "LICENSE"));
    } else {
      initializePackageContent(pkg, [{
        propertyName: "private",
        initValue: true,
      }]);
    }
  }
  if (options?.clearScripts) {
    pkg.scripts = {};
  }
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
  if (args.length > 0) {
    cli.wl(`Installing dependencies:`);
    for (const arg of args) {
      cli.wl(` - \x1b[36m${arg}\x1b[39m`);
    }
    spawnSync("npm", ["i", "--legacy-peer-deps", ...args], { shell: true, stdio: "inherit", cwd: wdir });
  }
  if (devArgs.length > 0) {
    cli.wl(`Installing devDependencies:`);
    for (const arg of devArgs) {
      cli.wl(` - \x1b[36m${arg}\x1b[39m`);
    }
    spawnSync("npm", ["i", "--save-dev", ...devArgs], { shell: true, stdio: "inherit", cwd: wdir });
  }
  if (options?.audit !== false) {
    cli.wl(`Auditing dependencies:`);
    spawnSync("npm", ["audit"], { shell: true, stdio: "inherit", cwd: wdir });
  }
};

export const getTemplateBaseDirname = () => {
  return path.join(__dirname, "../template");
};

export const generateTemplate = async (wdir: string, templateName: string, options?: { destDir?: string; }) => {
  cli.wl(`Create files from template: \x1b[36m${templateName}\x1b[39m`);
  await copy(path.join(getTemplateBaseDirname(), templateName), path.join(wdir, options?.destDir ?? ""), { overwrite: true, recursive: true });
  process.stdout.write("\n");
};

export const removeGit = (wdir: string) => {
  rimraf.sync(path.join(wdir, ".git"));
};

export const npmPackageInit = (wdir: string) => {
  spawnSync("npx", ["npm-package-utils", "init"], { shell: true, stdio: "inherit", cwd: wdir });
};

export const __appName__ = "__appName__";
export const replaceAppName = async (filePath: string, appName: string) => {
  return replaceTexts(filePath, [{ anchor: __appName__, text: appName }]);
};

export const replaceTexts = async (filePath: string, replaces: Array<{ anchor: string; text: string }>) => {
  cli.wl(`Replace texts: ${filePath}`);
  if (!existsSync(filePath)) {
    cli.wl(`\x1b[43m WARN \x1b[49m file not found: ${filePath}`);
    return false;
  }
  let targetFile = (await readFile(filePath)).toString();
  replaces.forEach(item => {
    const regExp = new RegExp(item.anchor, "g");
    targetFile = targetFile.replace(regExp, item.text);
    cli.wl(` - replace: ${item.anchor} -> ${item.text}`);
  });
  await writeFile(filePath, targetFile);
  process.stdout.write("\n");
  return true;
};

export const createEnv = async (wdir: string, lines: Array<string> = []) => {
  await writeFile(path.join(wdir, ".env"), lines.join("\n"));
};