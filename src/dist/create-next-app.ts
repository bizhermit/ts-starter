import { spawnSync } from "child_process";
import { existsSync, move, readFile, readFileSync, writeFile } from "fs-extra";
import path from "path";
import { analyzeArgsOptions, ArgsOptions } from "./common";

type Mode = "nexpress" | "f-b" | "frontend" | "backend" | "desktop" | "all";
type Struct = {[key: string]: any};

const createNextApp = async (wdir: string, mode: Mode = "all", options?: ArgsOptions) => {
  const { appName } = analyzeArgsOptions(wdir, options);

  const createNextAppCli = async (targetDir: string, options?: { preventMoveToSrc?: boolean; position?: "frontend" | "backend" | "alone" }) => {
    spawnSync("npx", ["create-next-app", targetDir, "--ts", "--use-npm"], { shell: true, stdio: "inherit", cwd: wdir });
    const configFilePath = path.join(targetDir, "next.config.js");
    let configFile = (await readFile(configFilePath)).toString();
    const configLines = configFile.split(/\n|\r\n/g);
    const endStructIndex = configLines.findIndex(line => line.match(/^}(;|\s)*$/)) ?? 1;
    if (!configLines[endStructIndex - 1].match(/,$/)) {
      configLines[endStructIndex - 1] = configLines[endStructIndex - 1] + ",";
    }
    let configAddLines: Array<string> = [];
    let envLines: Array<string> = [];
    switch (options?.position ?? "alone") {
      case "frontend":
        configAddLines = [
          `  basePath: process.env.BASE_PATH || undefined,`,
          `  env: {`,
          `    basePath: process.env.BASE_PATH || undefined,`,
          `    public: {`,
          `      apiHost: process.env.API_HOST || "localhost",`,
          `      apiPort: process.env.API_PORT || 8000,`,
          `      apiBasePath: process.env.API_BASE_PATH || undefined,`,
          `    }`,
          `  }`
        ];
        envLines = [
          "HOST=",
          "PORT=",
          `BASE_PATH=/${appName}`,
          "",
          "API_HOST=",
          "API_PORT=",
          `API_BASE_PATH=/${appName}`,
        ];
        break;
      case "backend":
        configAddLines = [
          `  basePath: process.env.BASE_PATH || undefined,`,
          `  env: {`,
          `    basePath: process.env.BASE_PATH || undefined,`,
          `  }`
        ];
        envLines = [
          "HOST=",
          "PORT=",
          `BASE_PATH=/${appName}`,
        ];
        break;
      default:
        configAddLines = [
          `  basePath: process.env.BASE_PATH || undefined,`,
          `  env: {`,
          `    basePath: process.env.BASE_PATH || undefined,`,
          `    public: {`,
          `      apiHost: process.env.HOST || "localhost",`,
          `      apiPort: process.env.PORT || 8000,`,
          `      apiBasePath: process.env.BASE_PATH || undefined,`,
          `    }`,
          `  }`
        ];
        envLines = [
          "HOST=",
          "PORT=",
          `BASE_PATH=/${appName}`,
        ];
        break;
    }
    configAddLines.forEach((line, idx) => {
      configLines.splice(endStructIndex + idx, 0, line);
    });
    configFile = configLines.join("\n");
    const envFile = envLines.join("\n");
    const commitFiles = async () => {
      await writeFile(configFilePath, configFile);
      await writeFile(path.join(targetDir, ".env.ex"), envFile);
    }
    if (options?.preventMoveToSrc) {
      await commitFiles();
      return;
    }
    const moveToSrc = async (fileName: string) => {
      const srcFilePath = path.join(targetDir, fileName);
      if (!existsSync(srcFilePath)) return;
      await move(srcFilePath, path.join(targetDir, "src", fileName), { overwrite: true });
    };
    await moveToSrc("next-env.d.ts");
    await moveToSrc("pages");
    await moveToSrc("public");
    await moveToSrc("styles");
    await moveToSrc("styles");
    await commitFiles();
  };

  if (mode !== "backend") {
    await createNextAppCli(path.join(wdir, "frontend"), { position: "frontend" });
  }
  if (mode !== "backend" && mode !== "nexpress") {
    await createNextAppCli(path.join(wdir, "backend"), { position: "backend" });
  }

  


  // const frontendDirName = "frontend";
  // const backendDirName = "backend";
  // const desktopDirName = "desktop";
  // const defaultVersion = "0.0.0-alpha.0";
  // const envItems: Array<string> = [
  //   `API_HOSTNAME=localhost`,
  //   `API_PORT=8000`,
  //   `API_BASE_PATH=/${appName}`
  // ];

  // const rootPkg: NpmPakcageStruct = {
  //   name: `${appName}`,
  //   version: defaultVersion,
  //   description: (() => {
  //     if (!options?.desktop) return "web app";
  //     if (!options?.server) return "dsktop app";
  //     return "web/desktop app";
  //   })(),
  //   private: true,
  //   scripts: {
  //     "frontend": `cpx .env ${frontendDirName} --update && cd ${frontendDirName} && npm run dev`,
  //   }
  // };

  // // frontend
  // spawnSync("npx", ["create-next-app", frontendDirName, "--ts", "--use-npm", "-y"], { shell: true, stdio: "inherit", cwd: wdir });
  // const frontendPkg = await getPackageJson(path.join(wdir, frontendDirName), { clearScripts: false });
  // delete frontendPkg.license;
  // frontendPkg.name = `${appName}-frontend`;
  // frontendPkg.version = defaultVersion;
  // frontendPkg.description = "frontend";
  // frontendPkg.scripts = {
  //   "clean": "npx rimraf .next .out",
  //   "dev": "npm run clean && npx next dev",
  //   "build": "npm run clean && npx next build",
  //   "start": "npm run build && npx next start",
  //   "export": "npm run build && npx next export -o .out",
  //   "lint": "npx next lint"
  // };
  // await savePackageJson(path.join(wdir, frontendDirName), frontendPkg);
  // installLibs(path.join(wdir, frontendDirName), [
  //   "@bizhermit/react-addon",
  //   "@bizhermit/basic-utils",
  // ], [
  //   "rimraf",
  // ]);

  // // backend
  // spawnSync("npx", ["create-next-app", backendDirName, "--ts", "--use-npm", "-y"], { shell: true, stdio: "inherit", cwd: wdir });
  // const backendPkg = await getPackageJson(path.join(wdir, backendDirName), { clearScripts: true });
  // delete backendPkg.license;
  // backendPkg.name = `${appName}-backend`;
  // backendPkg.version = defaultVersion;
  // backendPkg.description = "backend";
  // backendPkg.scripts ={
  //   "clean": "npx rimraf .server .next",
  // };
  // const backendDeps: Array<string> = [
  //   "@bizhermit/basic-utils",
  //   "dotenv",
  // ];
  // const backendDevDeps: Array<string> = [
  //   "rimraf",
  //   "@types/dotenv"
  // ];
  // const rootDeps: Array<string> = [];
  // const rootDevDeps: Array<string> = [];

  // if (options?.server) {
  //   backendDeps.push(
  //     "express",
  //     "express-session",
  //     "helmet",
  //   );
  //   backendDevDeps.push(
  //     "@types/express",
  //     "@types/express-session",
  //   );
  //   envItems.push(
  //     `APP_PORT=3000`,
  //     `APP_BASE_PATH=/${appName}`,
  //   );
  //   backendPkg.scripts = {
  //     ...backendPkg.scripts,
  //     "prebuild": "npm run clean && npx tsc -p tsconfig.server.json",
  //     "server": "npm run prebuild && node .server/main.js --dev",
  //     "build": "npx next build",
  //     "start": "npm run build && node .server/main.js"
  //   };
  //   rootPkg.scripts = {
  //     ...rootPkg.scripts,
  //     "backend": `cpx .env ${backendDirName} --update && cd ${backendDirName} && npm run server`,
  //     "server": "npm run backend & npm run frontend",
  //     "start": `cpx .env ${frontendDirName} --update && cd ${frontendDirName} && npm run start & cpx .env ${backendDirName} --update && cd ${backendDirName} && npm run start`
  //   };
  // }

  // if (options?.desktop) {
  //   await mkdir(path.join(wdir, desktopDirName), { recursive: true });
  //   const desktopPkg: NpmPakcageStruct = {
  //     name: `${appName}-desktop`,
  //     version: defaultVersion,
  //     description: "desktop",
  //     private: true,
  //   };
  //   rootDevDeps.push(
  //     "@bizhermit/minifier",
  //     "electron",
  //     "electron-builder",
  //     "rimraf",
  //     "typescript",
  //   );
  //   rootPkg.scripts = {
  //     ...rootPkg.scripts,
  //     "desktop": `npx rimraf .desktop && npx tsc -p ${desktopDirName}/tsconfig.json && npx electron .desktop/main.js`,
  //     "prepack": `npx rimraf .desktop .build && npx tsc -p ${desktopDirName}/tsconfig.json && npx minifier .desktop && cd ${frontendDirName} && npm run export`,
  //     "pack": "npx electron-builder --dir",
  //     "pack:linux": "npm run pack -- --linux",
  //     "pack:win": "npm run pack -- --win",
  //     "pack:mac": "npm run pack -- --mac",
  //   };
  //   rootPkg.build = {
  //     "appId": `example.${appName}`,
  //     "productName": appName,
  //     "asar": true,
  //     "extends": null,
  //     "extraMetadata": {
  //       "main": ".desktop/main.js"
  //     },
  //     "files": [
  //       ".desktop",
  //       `${frontendDirName}/.out`,
  //       `${backendDirName}/.next`
  //     ],
  //     "extraFiles": [{
  //       "from": "LICENSE",
  //       "to": "LICENSE",
  //     }, {
  //       "from": "CREDIT",
  //       "to": "CREDIT",
  //     }],
  //     "directories": {
  //       "output": ".build",
  //     },
  //     "win": {
  //       "icon": `${frontendDirName}/.out/favicon.ico`,
  //       "target": {
  //         "target": "nsis",
  //         "arch": ["x64"],
  //       },
  //     },
  //     "mac": {
  //       "icon": `${frontendDirName}/.out/favicon.ico`,
  //       "target": "dmg"
  //     },
  //     "linux": {
  //       "icon": `${frontendDirName}/.out/favicon.ico`,
  //       "target":[
  //         "deb",
  //         "rpm",
  //         "snap",
  //         "AppImage"
  //       ],
  //       "category":"Development",
  //     },
  //     "nsis": {
  //       "oneClick": false,
  //       "allowToChangeInstallationDirectory": true,
  //       "installerIcon": `${frontendDirName}/.out/favicon.ico`,
  //       "installerHeaderIcon": `${frontendDirName}/.out/favicon.ico`,
  //     },
  //   };
  //   rootPkg.browser = {
  //     fs: false,
  //     path: false,
  //   };
  //   await savePackageJson(path.join(wdir, desktopDirName), desktopPkg);
  //   installLibs(path.join(wdir, desktopDirName), [
  //     "@bizhermit/basic-utils",
  //     "fs-extra",
  //     "electron-is-dev",
  //     "electron-next",
  //   ], [
  //     "@types/fs-extra"
  //   ]);
  // }
  // await savePackageJson(path.join(wdir, backendDirName), backendPkg);
  // installLibs(path.join(wdir, backendDirName), backendDeps, backendDevDeps);

  // // root
  // await savePackageJson(wdir, rootPkg);
  // installLibs(wdir, rootDeps, rootDevDeps);
  // await generateTemplate(wdir, "next-app");
  
  // await createEnv(wdir, envItems);
  // await replaceAppName(path.join(wdir, backendDirName, "main.ts"), appName);
  // await replaceAppName(path.join(wdir, desktopDirName, "main.ts"), appName);

/**-----------------------------old---------------------------------- */

  // await mkdir(path.join(wdir, clientDirName));
  // rimraf.sync(path.join(wdir, "pages"));
  // rimraf.sync(path.join(wdir, "public"));
  // rimraf.sync(path.join(wdir, "styles"));
  // await move(path.join(wdir, "next-env.d.ts"), path.join(wdir, clientDirName, "next-env.d.ts"));
  // await move(path.join(wdir, "tsconfig.json"), path.join(wdir, clientDirName, "tsconfig.json"));

  // const gitignorePath = path.join(wdir, ".gitignore");
  // let gitignoreContent = (await readFile(gitignorePath)).toString();
  // gitignoreContent = gitignoreContent
  //   .replace("/.next/", `/${clientDirName}/.next/`)
  //   .replace("/out/", `/${clientDirName}/out/`);
  // gitignoreContent += `\n# @bzihermit/starter`;
  // const addGitignoreContents = (lines: Array<string>) => {
  //   lines.forEach(line => {
  //     gitignoreContent += `\n${line}`;
  //   });
  // }
  // addGitignoreContents(["/.vscode", `${clientDirName}/main`]);
  // if (options?.desktop) {
  //   addGitignoreContents([`/${desktopDirName}/resources/config.json`]);
  // }
  // await writeFile(gitignorePath, gitignoreContent);

  // const deps = [
  //   "@bizhermit/react-addon",
  //   "@bizhermit/basic-utils",
  // ];
  // const devDeps = [
  //   "@bizhermit/license",
  //   "@bizhermit/minifier",
  //   "@types/node",
  //   "rimraf",
  // ];
  // const envLines = [

  // ];

  // const pkg = await getPackageJson(wdir, { clearScripts: true });
  // pkg.version = "0.0.0-alpha.0";
  // pkg.scripts = {
  //   "clean": `npx rimraf main ${clientDirName}/.next ${clientDirName}/out`,
  //   "license": "npx rimraf CREDIT && npx license -o CREDIT --returnError -exclude caniuse-lite",
  //   "test": "npx next lint src",
  // };
  // if (options?.server) {
  //   pkg.scripts = {
  //     ...pkg.scripts,
  //     "server": `npm run clean && npx tsc -p ${serverDirName}/tsconfig.json && node main/src-server/index.js -dev`,
  //     "build": `npm run license && npm run clean && npx tsc -p ${serverDirName}/tsconfig.json && npx minifier main && npx next build src`,
  //     "start": "node main/src-server/index.js",
  //     "export": "npm run build && npx next export"
  //   };
  //   deps.push("express");
  //   deps.push("express-session");
  //   deps.push("helmet");
  //   devDeps.push("@types/express");
  //   devDeps.push("@types/express-session");
  // }
  // if (options?.desktop) {
  //   pkg.scripts = {
  //     ...pkg.scripts,
  //     "desktop": "npm run clean && npx tsc -p src-desktop/tsconfig.json && npx electron main/src-desktop/index.js",
  //     "prepack": "npm run license && npm run clean && npx rimraf build",
  //     "pack": `npx tsc -p src-desktop/tsconfig.json && npx minifier main ${!options?.server ? "" : "&& set APP_BASE_PATH= "}&& npx next build src && npx next export src && electron-builder --dir`,
  //     "pack:linux": "npm run pack -- --linux",
  //     "pack:win": "npm run pack -- --win",
  //     "pack:mac": "npm run pack -- --mac",
  //   };
  //   pkg.build = {
  //     "appId": `example.${appName}`,
  //     "productName": appName,
  //     "asar": true,
  //     "extends": null,
  //     "extraMetadata": {
  //       "main": "main/src-desktop/index.js"
  //     },
  //     "files": ["main", "src/out", "src/public"],
  //     "extraFiles": [{
  //       "from": "LICENSE",
  //       "to": "LICENSE",
  //     }, {
  //       "from": "CREDIT",
  //       "to": "CREDIT",
  //     }],
  //     "directories": {
  //       "output": "build",
  //     },
  //     "win": {
  //       "icon": "src/public/favicon.ico",
  //       "target": {
  //         "target": "nsis",
  //         "arch": ["x64"],
  //       },
  //     },
  //     "mac": {
  //       "icon": "src/public/favicon.ico",
  //       "target": "dmg"
  //     },
  //     "linux": {},
  //     "nsis": {
  //       "oneClick": false,
  //       "allowToChangeInstallationDirectory": true,
  //     },
  //   };
  //   pkg.browser = {
  //     fs: false,
  //     path: false,
  //   };
  //   deps.push("electron-is-dev");
  //   deps.push("electron-next");
  //   deps.push("fs-extra");
  //   devDeps.push("electron");
  //   devDeps.push("electron-builder");
  //   devDeps.push("@types/fs-extra");
  // }
  // await savePackageJson(wdir, pkg);
  // installLibs(wdir, deps, devDeps);

  // await generateTemplate(wdir, "next-app");

  // const replaceAppName = async (filePath: string) => {
  //   let targetFile = (await readFile(filePath)).toString();
  //   targetFile = targetFile.replace(/__appName__/g, appName);
  //   await writeFile(filePath, targetFile);
  // };
  // await replaceAppName(path.join(wdir, "next.config.js"));
  // if (options?.server) {
  //   await replaceAppName(path.join(wdir, "src-server", "index.ts"));
  //   envLines.push(`APP_BASE_PATH=/${appName}`);
  //   envLines.push(`APP_PORT=8080`);
  //   envLines.push("");
  //   envLines.push("API_ORIGIN=");
  // }
  // if (options?.desktop) {
  //   await replaceAppName(path.join(wdir, desktopDirName, "index.ts"));
  // }
  // if (!options?.server) {
  //   await generateTemplate(wdir, "next-app-desktop");
  //   rimraf.sync(path.join(wdir, serverDirName));
  // }
  // if (!options?.desktop) {
  //   await generateTemplate(wdir, "next-app-server");
  //   rimraf.sync(path.join(wdir, desktopDirName));
  //   rimraf.sync(path.join(wdir, `${clientDirName}/modules/electron-accessor.ts`));
  //   rimraf.sync(path.join(wdir, `${clientDirName}/modules/frontend/use-electron.ts`));
  // }
  // await mkdir(path.join(wdir, `${clientDirName}/core/components`), { recursive: true });
  // await mkdir(path.join(wdir, `${clientDirName}/modules/frontend`), { recursive: true });
  // await mkdir(path.join(wdir, `${clientDirName}/modules/backend`), { recursive: true });
  // await mkdir(path.join(wdir, `${clientDirName}/hooks`), { recursive: true });

  // removeGit(wdir);
};
export default createNextApp;