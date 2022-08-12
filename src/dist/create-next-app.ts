import { spawnSync } from "child_process";
import { existsSync, move, readFile, readFileSync, rm, rmdir, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, removeGit, replaceAppName, savePackageJson } from "./common";

type Mode = "all" | "frontend" | "backend" | "web" | "desktop";

const createNextApp = async (wdir: string, mode: Mode = "all", separate = false, options?: ArgsOptions) => {
  const { appName } = analyzeArgsOptions(wdir, options);

  const createNextAppCli = async (targetDir: string, options?: { position?: "frontend" | "backend" | "alone" }) => {
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

    const gitignorePath = path.join(targetDir, ".gitignore");
    let gitignoreContent = (await readFile(gitignorePath)).toString();
    gitignoreContent = gitignoreContent
        .replace("/.next/", "/.next/")
        .replace("/out/", "/.dist/")
    gitignoreContent += `\n# develop`;
    const addGitignoreContents = (lines: Array<string>) => {
        lines.forEach(line => {
            gitignoreContent += `\n${line}`;
        });
    }
    addGitignoreContents(["/.vscode"]);
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
        addGitignoreContents(["/resources/config.json"]);
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
      await writeFile(gitignorePath, gitignoreContent);
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

// type Mode = "all" | "frontend" | "backend" | "web" | "desktop";
  if (separate) {

  } else {
    await createNextAppCli(wdir, { position: "alone" });
    const pkg = await getPackageJson(wdir, { appName });
    const deps: Array<string> = ["@bizhermit/basic-utils"];
    const devDeps: Array<string> = ["rimraf"];
    let hasDesktop = false, hasBackend = false, hasFrontend = false;
    // desktop
    if (mode === "desktop" || mode === "all") {
      hasDesktop = true;
      await generateTemplate(wdir, "next-app/desktop", { destDir: "nextron" });
      await replaceAppName(path.join(wdir, "nextron/main.ts"), appName);
      deps.push(
        "fs-extra",
        "electron-is-dev",
        "electron-next",
      );
      devDeps.push(
        "@bizhermit/minifier",
        "@types/fs-extra",
        "electron",
        "electron-builder",
      );
    }
    // backend
    if (mode !== "frontend") {
      hasBackend = true;
      await generateTemplate(wdir, "next-app/backend");
      if (hasDesktop) await generateTemplate(wdir, "next-app/backend-desktop");
      await replaceAppName(path.join(wdir, "main.ts"), appName);
      deps.push(
        "dotenv",
        "express",
        "express-session",
        "helmet",
      );
      devDeps.push(
        "@types/dotenv",
        "@types/express",
        "@types/express-session",
      );
    }
    // frontend
    if (mode !== "backend") {
      hasFrontend = true;
      await generateTemplate(wdir, "next-app/frontend");
      if (hasDesktop) await generateTemplate(wdir, "next-app/frontend-desktop");
      deps.push(
        "@bizhermit/react-addon",
      );
    }

    pkg.scripts = {
      "dev": "npx next dev",
      "build": "npx next build",
      "next": "npx next start",
      "export": "npx rimraf dist/next && npm run build && npx next export -o dist/next",
    };
    if (hasFrontend) {
      pkg.scripts = {
        ...pkg.scripts,
      };
    }
    if (hasBackend) {
      pkg.scripts = {
        ...pkg.scripts,
        "nexpress": "npx rimraf .next && npm run prestart && node .nexpress/main.js -d",
        "prestart": "npx rimraf .nexpress && npx tsc -p tsconfig.nexpress.json",
        "start": "npm run build && node .nexpress/main.js",
      };
    }
    if (hasDesktop) {
      pkg.scripts = {
        ...pkg.scripts,
        "nextron": "npx rimraf .next && npm run prepack && npx electron .nextron/main.js",
        "prepack": "npx rimraf .nextron && npx tsc -p nextron/tsconfig.json",
        "pack": "npx minifier .nextron && npm run export && npx electron-builder --dir",
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
          "main": ".nextron/main.js"
        },
        "files": [
          ".nextron",
          ".out",
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
          "icon": `.next/favicon.ico`,
          "target": {
            "target": "nsis",
            "arch": ["x64"],
          },
        },
        "mac": {
          "icon": `.next/favicon.ico`,
          "target": "dmg"
        },
        "linux": {
          "icon": `.next/favicon.ico`,
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
          "installerIcon": `.next/favicon.ico`,
          "installerHeaderIcon": `.next/favicon.ico`,
        },
      };
      pkg.browser = {
        fs: false,
        path: false,
      };
    }
    switch (mode) {
      case "desktop":
        pkg.scripts = {
          "clean": "npx rimraf dist .nextron .next node_modules",
          ...pkg.scripts,
        };
        break;
      case "backend":
        pkg.scripts = {
          "clean": "npx rimraf dist .nexpress .nextron .next node_modules",
          ...pkg.scripts,
        };
        break;
      case "frontend":
        pkg.scripts = {
          "clean": "npx rimraf dist .nexpress .next node_modules",
          ...pkg.scripts,
        };
        break;
      case "web":
        pkg.scripts = {
          "clean": "npx rimraf dist .nexpress .next node_modules",
          ...pkg.scripts,
        };
        break;
      default:
        pkg.scripts = {
          "clean": "npx rimraf dist .nexpress .nextron .next node_modules",
          ...pkg.scripts,
        };
        break;
    }
    await savePackageJson(wdir, pkg);

    installLibs(wdir, deps, devDeps);
  }

  // frontend
  // if (mode !== "backend") {
  //   const relativeDir = (mode !== "frontend" && mode !== "nexpress") ? "frontend" : "";
  //   const frontendDir = path.join(wdir, relativeDir);

  //   await createNextAppCli(frontendDir, { position: "frontend" });
  //   rimraf.sync(path.join(frontendDir, "src/pages"));
  //   rimraf.sync(path.join(frontendDir, "src/styles"));
  //   if (mode === "nexpress") {
  //     await generateTemplate(wdir, "next-app/backend");
  //   }
  //   await generateTemplate(wdir, "next-app/frontend", { destDir: relativeDir });
  //   if (relativeDir) {
  //     await generateTemplate(wdir, "dev-env/next-app/frontend", { destDir: relativeDir });
  //     await replaceAppName(path.join(frontendDir, ".devcontainer/devcontainer.json"), appName + ":frontend");
  //     await replaceAppName(path.join(frontendDir, ".devcontainer/docker-compose.yml"), appName + ":frontend");
  //   }
  //   if (mode === "all" || mode === "desktop") {
  //     await generateTemplate(wdir, "next-app/frontend-desktop", { destDir: relativeDir });
  //   }

  //   const pkg = await getPackageJson(frontendDir, { appName, clearScripts: true });
  //   pkg.scripts = {
  //     "clean": "npx rimraf .next .dist",
  //     "dev": "npm run clean && npx next dev",
  //     "build": "npm run clean && npx next build",
  //     "start": "npm run build && npx next start",
  //     "export": "npm run build && npx next export -o .dist",
  //     "lint": "npx next lint"
  //   };
  //   await savePackageJson(frontendDir, pkg);

  //   installLibs(frontendDir, [
  //     "@bizhermit/react-addon",
  //     "@bizhermit/basic-utils"
  //   ], [
  //     "rimraf",
  //   ]);
  // }

  // // backend
  // if (mode !== "frontend" && mode !== "nexpress") {
  //   const relativeDir = (mode !== "backend") ? "backend" : "";
  //   const backendDir = path.join(wdir, relativeDir);

  //   await createNextAppCli(backendDir, { position: "backend" });
  //   rimraf.sync(path.join(backendDir, "src/pages"));
  //   rimraf.sync(path.join(backendDir, "src/styles"));
  //   await generateTemplate(wdir, "next-app/backend", { destDir: relativeDir });
  //   await replaceAppName(path.join(backendDir, "main.ts"), appName);
  //   if (relativeDir) {
  //     await generateTemplate(wdir, "dev-env/next-app/backend", { destDir: relativeDir });
  //     await replaceAppName(path.join(backendDir, ".devcontainer/devcontainer.json"), appName + ":backend");
  //     await replaceAppName(path.join(backendDir, ".devcontainer/docker-compose.yml"), appName + ":backend");
  //   }
  //   if (mode === "all" || mode === "desktop") {
  //     await generateTemplate(wdir, "next-app/backend-desktop", { destDir: relativeDir });
  //   }

  //   const pkg = await getPackageJson(backendDir, { appName, clearScripts: true });
  //   pkg.scripts = {
  //     "clean": "npx rimraf .dist .next",
  //     "prebuild": "npm run clean && npx tsc -p tsconfig.server.json",
  //     "dev": "npm run prebuild && node .dist/main.js --dev",
  //     "build": "npx next build",
  //     "start": "npm run build && node .dist/main.js",
  //     "lint": "npx next lint"
  //   };
  //   await savePackageJson(backendDir, pkg);

  //   installLibs(backendDir, [
  //     "dotenv",
  //     "express",
  //     "express-session",
  //     "helmet",
  //   ], [
  //     "@types/dotenv",
  //     "@types/express",
  //     "@types/express-session",
  //   ]);
  // }

  // await generateTemplate(wdir, "dev-env/next-app/root");
  // await replaceAppName(path.join(wdir, ".devcontainer/devcontainer.json"), appName);
  // await replaceAppName(path.join(wdir, ".devcontainer/docker-compose.yml"), appName);

  // if (mode === "all" || mode === "desktop") {
  //   await generateTemplate(wdir, "next-app/desktop", { destDir: "desktop" });
  //   await replaceAppName(path.join(wdir, "desktop/main.ts"), appName);

  //   const pkg = await getPackageJson(wdir, { appName });
  //   pkg.scripts = {
  //     "frontend": `cd frontend && npm run dev`,
  //     "backend": `cd backend && npm run dev`,
  //     "server": "npm run backend & npm run frontend",
  //     "start": `cd frontend && npm run start && cd backend && npm run start`,
  //     "desktop": `npx rimraf .desktop && npx tsc -p desktop/tsconfig.json && npx electron .desktop/main.js`,
  //     "prepack": `npx rimraf .desktop .dist && npx tsc -p desktop/tsconfig.json && npx minifier .desktop && cd frontend && npm run export`,
  //     "pack": "npx electron-builder --dir",
  //     "pack:linux": "npm run pack -- --linux",
  //     "pack:win": "npm run pack -- --win",
  //     "pack:mac": "npm run pack -- --mac",      
  //   };

  
  //   await savePackageJson(wdir, pkg);

  //   installLibs(wdir, [
  //     "@bizhermit/basic-utils",
  //     "fs-extra",
  //     "electron-is-dev",
  //     "electron-next",
  //   ], [
  //     "@types/fs-extra"
  //   ]);
  // }

  removeGit(wdir);
};
export default createNextApp;