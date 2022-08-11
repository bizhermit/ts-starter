import { spawnSync } from "child_process";
import { existsSync, move, readFile, readFileSync, rm, rmdir, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, removeGit, replaceAppName, savePackageJson } from "./common";

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
          `  basePath: process.env.BASE_PATH,`,
          `  env: {`,
          `    BASE_PATH: process.env.BASE_PATH,`,
          `    public: {`,
          `      API_PROTOCOL: process.env.API_PROTOCOL,`,
          `      API_HOST_NAME: process.env.API_HOST_NAME,`,
          `      API_PORT: process.env.API_PORT,`,
          `      API_BASE_PATH: process.env.API_BASE_PATH,`,
          `    }`,
          `  }`
        ];
        envLines = [
          `BASE_PATH=/${appName}`,
          "",
          "API_PROTOCOL=http:",
          "API_HOST_NAME=localhost",
          "API_PORT=8000",
          `API_BASE_PATH=/${appName}`,
        ];
        break;
      case "backend":
        configAddLines = [
          `  basePath: process.env.BASE_PATH,`,
          `  env: {`,
          `    BASE_PATH: process.env.BASE_PATH,`,
          `  }`
        ];
        envLines = [
          `API_BASE_PATH=/${appName}`,
          "API_PORT=8080",
        ];
        break;
      default:
        configAddLines = [
          `  basePath: process.env.BASE_PATH,`,
          `  env: {`,
          `    BASE_PATH: process.env.BASE_PATH,`,
          `    public: {`,
          `      API_BASE_PATH: process.env.BASE_PATH,`,
          `    }`,
          `  }`
        ];
        envLines = [
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

  // frontend
  if (mode !== "backend") {
    const relativeDir = (mode !== "frontend" && mode !== "nexpress") ? "frontend" : "";
    const frontendDir = path.join(wdir, relativeDir);

    await createNextAppCli(frontendDir, { position: "frontend" });
    rimraf.sync(path.join(frontendDir, "src/pages"));
    rimraf.sync(path.join(frontendDir, "src/styles"));
    await generateTemplate(wdir, "next-app/frontend", { destDir: relativeDir, license: false });
    if (relativeDir) {
      await generateTemplate(wdir, "dev-env/next-app/frontend", { destDir: relativeDir, license: false });
      await replaceAppName(path.join(frontendDir, ".devcontainer/devcontainer.json"), appName + ":frontend");
      await replaceAppName(path.join(frontendDir, ".devcontainer/docker-compose.yml"), appName + ":frontend");
    }

    const pkg = await getPackageJson(frontendDir, { appName, clearScripts: true });
    pkg.scripts = {
      "clean": "npx rimraf .next .dist",
      "dev": "npm run clean && npx next dev",
      "build": "npm run clean && npx next build",
      "start": "npm run build && npx next start",
      "export": "npm run build && npx next export -o .dist",
      "lint": "npx next lint"
    };
    await savePackageJson(frontendDir, pkg);

    installLibs(frontendDir, [
      "@bizhermit/react-addon",
      "@bizhermit/basic-utils"
    ], [
      "rimraf",
    ]);
  }

  // backend
  if (mode !== "frontend" && mode !== "nexpress") {
    const relativeDir = (mode !== "backend") ? "backend" : "";
    const backendDir = path.join(wdir, relativeDir);

    await createNextAppCli(backendDir, { position: "backend" });
    rimraf.sync(path.join(backendDir, "src/pages"));
    rimraf.sync(path.join(backendDir, "src/styles"));
    await generateTemplate(wdir, "next-app/backend", { destDir: relativeDir, license: false });
    await replaceAppName(path.join(backendDir, "main.ts"), appName);
    if (relativeDir) {
      await generateTemplate(wdir, "dev-env/next-app/backend", { destDir: relativeDir, license: false });
      await replaceAppName(path.join(backendDir, ".devcontainer/devcontainer.json"), appName + ":backend");
      await replaceAppName(path.join(backendDir, ".devcontainer/docker-compose.yml"), appName + ":backend");
    }

    const pkg = await getPackageJson(backendDir, { appName, clearScripts: true });
    pkg.scripts = {
      "clean": "npx rimraf .server .next",
      "prebuild": "npm run clean && npx tsc -p tsconfig.server.json",
      "server": "npm run prebuild && node .server/main.js --dev",
      "build": "npx next build",
      "start": "npm run build && node .server/main.js",
      "lint": "npx next lint"
    };
    await savePackageJson(backendDir, pkg);

    installLibs(backendDir, [
      "dotenv",
      "express",
      "express-session",
      "helmet",
    ], [
      "@types/dotenv",
      "@types/express",
      "@types/express-session",
    ]);
  }

  await generateTemplate(wdir, "dev-env/next-app/root", { license: false });
  await replaceAppName(path.join(wdir, ".devcontainer/devcontainer.json"), appName);
  await replaceAppName(path.join(wdir, ".devcontainer/docker-compose.yml"), appName);

  if (mode === "all" || mode === "desktop") {
    await generateTemplate(wdir, "next-app/desktop", { destDir: "desktop", license: false });
    await replaceAppName(path.join(wdir, "desktop/main.ts"), appName);

    const pkg = await getPackageJson(wdir, { appName });
    pkg.scripts = {
      "frontend": `cd frontend && npm run dev`,
      "backend": `cd backend && npm run server`,
      "server": "npm run backend & npm run frontend",
      "start": `cd frontend && npm run start && cd backend && npm run start`,
      "desktop": `npx rimraf .desktop && npx tsc -p desktop/tsconfig.json && npx electron .desktop/main.js`,
      "prepack": `npx rimraf .desktop .dist && npx tsc -p desktop/tsconfig.json && npx minifier .desktop && cd frontend && npm run export`,
      "pack": "npx electron-builder --dir",
      "pack:linux": "npm run pack -- --linux",
      "pack:win": "npm run pack -- --win",
      "pack:mac": "npm run pack -- --mac",      
    };

    pkg.build = {
      "appId": `example.${appName}`,
      "productName": appName,
      "asar": true,
      "extends": null,
      "extraMetadata": {
        "main": ".desktop/main.js"
      },
      "files": [
        ".desktop",
        `frontend/.dist`,
        `backend/.next`
      ],
      "extraFiles": [{
        "from": "LICENSE",
        "to": "LICENSE",
      }, {
        "from": "CREDIT",
        "to": "CREDIT",
      }],
      "directories": {
        "output": ".build",
      },
      "win": {
        "icon": `frontend/.dist/favicon.ico`,
        "target": {
          "target": "nsis",
          "arch": ["x64"],
        },
      },
      "mac": {
        "icon": `frontend/.dist/favicon.ico`,
        "target": "dmg"
      },
      "linux": {
        "icon": `frontend/.dist/favicon.ico`,
        "target":[
          "deb",
          "rpm",
          "snap",
          "AppImage"
        ],
        "category":"Development",
      },
      "nsis": {
        "oneClick": false,
        "allowToChangeInstallationDirectory": true,
        "installerIcon": `frontend/.dist/favicon.ico`,
        "installerHeaderIcon": `frontend/.dist/favicon.ico`,
      },
    };
    pkg.browser = {
      fs: false,
      path: false,
    };
    await savePackageJson(wdir, pkg);

    installLibs(wdir, [
      "@bizhermit/basic-utils",
      "fs-extra",
      "electron-is-dev",
      "electron-next",
    ], [
      "@types/fs-extra"
    ]);
  }

  removeGit(wdir);
};
export default createNextApp;