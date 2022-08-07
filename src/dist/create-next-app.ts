import { spawnSync } from "child_process";
import { move } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { createEnv, generateTemplate, getPackageJson, installLibs, savePackageJson } from "./common";

type NpmPakcageStruct = {[key: string]: any};

const createNextApp = async (wdir: string, options?: { server?: boolean; desktop?: boolean; }) => {
  const appName = path.basename(wdir);
  const frontendDirName = "frontend";
  const backendDirName = "backend";
  const defaultVersion = "0.0.0-alpha.0";
  const envItems: Array<string> = [
    `API_HOSTNAME=localhost`,
    `API_PORT=8008`,
    `API_BASE_PATH=/${appName}`
  ];

  const rootPkg: NpmPakcageStruct = {
    name: `${appName}`,
    version: defaultVersion,
    description: (() => {
      if (!options?.desktop) return "web app";
      if (!options?.server) return "dsktop app";
      return "web/desktop app";
    })(),
    private: true,
    scripts: {
      "frontend": `cpx .env frontend --update && cd ${frontendDirName} && npm run dev`,
    }
  };

  // frontend
  spawnSync("npx", ["create-next-app", frontendDirName, "--ts", "--use-npm", "-y"], { shell: true, stdio: "inherit", cwd: wdir });
  const frontendPkg = await getPackageJson(path.join(wdir, frontendDirName), { clearScripts: false });
  delete frontendPkg.license;
  frontendPkg.name = `${appName}:frontend`;
  frontendPkg.version = defaultVersion;
  frontendPkg.description = "frontend";
  frontendPkg.scripts = {
    "clean": "npx rimraf .next .out",
    "dev": "npm run clean && npx next dev",
    "build": "npm run clean && npx next build",
    "start": "npm run build && npx next start",
    "export": "npm run build && npx next export -o .out",
    "lint": "npx next lint"
  };
  await savePackageJson(path.join(wdir, frontendDirName), frontendPkg);
  installLibs(path.join(wdir, frontendDirName), [
    "@bizhermit/react-addon",
    "@bizhermit/basic-utils",
  ], [
    "rimraf",
  ]);

  // backend
  spawnSync("npx", ["create-next-app", backendDirName, "--ts", "--use-npm", "-y"], { shell: true, stdio: "inherit", cwd: wdir });
  rimraf.sync(path.join(wdir, backendDirName, "pages"));
  rimraf.sync(path.join(wdir, backendDirName, "public"));
  rimraf.sync(path.join(wdir, backendDirName, "styles"));
  await move(path.join(wdir, backendDirName, "next-env.d.ts"), path.join(wdir, backendDirName, "next/next-env.d.ts"));
  await move(path.join(wdir, backendDirName, "tsconfig.json"), path.join(wdir, backendDirName, "next/tsconfig.json"));
  const backendPkg = await getPackageJson(path.join(wdir, backendDirName), { clearScripts: true });
  delete backendPkg.license;
  backendPkg.name = `${appName}:backend`;
  backendPkg.version = defaultVersion;
  backendPkg.description = "backend";
  backendPkg.scripts ={
    "clean": "npx rimraf .main .next",
  };
  const backendDeps: Array<string> = [
    "@bizhermit/basic-utils",
    "dotenv",
  ];
  const backendDevDeps: Array<string> = [
    "rimraf",
    "@types/dotenv"
  ];
  const rootDeps: Array<string> = [];
  const rootDevDeps: Array<string> = [];

  if (options?.server) {
    backendDeps.push(
      "express",
      "express-session",
      "helmet",
    );
    backendDevDeps.push(
      "@types/express",
      "@types/express-session",
    );
    envItems.push(
      `APP_PORT=3003`,
      `APP_BASE_PATH=/${appName}`,
    );
    backendPkg.scripts = {
      ...backendPkg.scripts,
      "server": "npm run clean && npx tsc -p tsconfig.json && node .main/server.js --dev",
    };
    rootPkg.scripts = {
      ...rootPkg.scripts,
      "backend": `cpx .env backend --update && cd ${backendDirName} && npm run server`,
      "server": "npm run backend & npm run frontend",
    };
  }

  if (options?.desktop) {
    rootDeps.push(
      "fs-extra",
      "electron-is-dev",
      "electron-next",
    );
    rootDevDeps.push(
      "@bizhermit/minifier",
      "@types/fs-extra",
      "electron",
      "electron-builder",
      "rimraf",
      "typescript",
    );
    rootPkg.scripts = {
      ...rootPkg.scripts,
      "desktop": "npx rimraf .desktop backend/next/out frontend/out && npx tsc -p tsconfig.json && electron .desktop/desktop/index.js",
      "pack": "npx rimraf .desktop backend/next/out frontend/out && npx tsc -p tsconfig.json && npx minifier .desktop && npx next build frontend && npx next export frontend && electron-builder --dir",
      "pack:linux": "npm run pack -- --linux",
      "pack:win": "npm run pack -- --win",
      "pack:mac": "npm run pack -- --mac",
    };
    rootPkg.build = {
      "appId": `example.${appName}`,
      "productName": appName,
      "asar": true,
      "extends": null,
      "extraMetadata": {
        "main": ".desktop/desktop/index.js"
      },
      "files": [".desktop", "frontend/out", "frontend/public"],
      "extraFiles": [{
        "from": "LICENSE",
        "to": "LICENSE",
      }, {
        "from": "CREDIT",
        "to": "CREDIT",
      }],
      "directories": {
        "output": "build",
      },
      "win": {
        "icon": "frontend/public/favicon.ico",
        "target": {
          "target": "nsis",
          "arch": ["x64"],
        },
      },
      "mac": {
        "icon": "frontend/public/favicon.ico",
        "target": "dmg"
      },
      "linux": {},
      "nsis": {
        "oneClick": false,
        "allowToChangeInstallationDirectory": true,
      },
    };
    rootPkg.browser = {
      fs: false,
      path: false,
    };
  }
  await savePackageJson(path.join(wdir, backendDirName), backendPkg);
  installLibs(path.join(wdir, backendDirName), backendDeps, backendDevDeps);

  // root
  await savePackageJson(wdir, rootPkg);
  installLibs(wdir, rootDeps, rootDevDeps);
  await generateTemplate(wdir, "next-app");
  
  await createEnv(wdir, envItems);

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