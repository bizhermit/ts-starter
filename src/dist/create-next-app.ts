import { spawnSync } from "child_process";
import { existsSync, move, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, removeGit, replaceAppName, replaceTexts, savePackageJson } from "./common";

type Mode = "all" | "frontend" | "backend" | "web" | "desktop";

const createNextApp = async (wdir: string, mode: Mode = "all", separate = false, options?: ArgsOptions) => {
  const { appName, platform } = analyzeArgsOptions(wdir, options);

  const srcDir = "src";
  const nexpressDir = "nexpress";
  const nextronDir = "nextron";
  const distDir = "dist";
  const distNextDir = "next";
  const distPackDir = "pack";
  const nextDistDir = ".next";
  const nexpressDistDir = ".nexpress";
  const mainDistDir = ".main";
  const rendererDistDir = ".renderer";

  const createNextAppCli = async (targetDir: string, options?: { position?: "separete" | "alone" }) => {
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
        .replace("/.next/", `/${nextDistDir}/`)
        .replace("/out/", `/${distDir}/`)
    gitignoreContent += `\n# develop`;
    const addGitignoreContents = (lines: Array<string>) => {
        lines.forEach(line => {
            gitignoreContent += `\n${line}`;
        });
    }
    addGitignoreContents(["/.vscode/settings.json", `/${nexpressDistDir}/`, `/${mainDistDir}/`, `/${rendererDistDir}/`]);
    if (separate) {
      // TODO
    } else {
      switch (mode) {
        case "frontend":
          configAddLines = [
            `  basePath: process.env.BASE_PATH,`,
            `  env: {`,
            `    BASE_PATH: process.env.BASE_PATH,`,
            `    API_PROTOCOL: process.env.API_PROTOCOL,`,
            `    API_HOST_NAME: process.env.API_HOST_NAME,`,
            `    API_PORT: process.env.API_PORT,`,
            `    API_BASE_PATH: process.env.BASE_PATH,`,
            `  }`
          ];
          envLines.push(
            `BASE_PATH=`,
            "API_PROTOCOL=",
            "API_HOST_NAME=",
            "API_PORT=",
            `API_BASE_PATH=$BASE_PATH`,
          );
          break;
        case "desktop":
          break;
        default:
          configAddLines = [
            `  basePath: process.env.BASE_PATH,`,
            `  env: {`,
            `    BASE_PATH: process.env.BASE_PATH,`,
            `    PORT: process.env.PORT,`,
            `    API_BASE_PATH: process.env.BASE_PATH,`,
            `  }`
          ];
          envLines.push(
            `BASE_PATH=`,
            `PORT=`,
          );
          break;
      }
    }
    configAddLines.filter(line => !line).forEach((line, idx) => {
      configLines.splice(endStructIndex + idx, 0, line);
    });
    configFile = configLines.join("\n");
    const envFile = envLines.join("\n");
    const commitFiles = async () => {
      await writeFile(configFilePath, configFile);
      await writeFile(path.join(targetDir, "..env"), envFile);
      await writeFile(gitignorePath, gitignoreContent);
    }
    const moveToSrc = async (fileName: string) => {
      const srcFilePath = path.join(targetDir, fileName);
      if (!existsSync(srcFilePath)) return;
      await move(srcFilePath, path.join(targetDir, srcDir, fileName), { overwrite: true });
    };
    await moveToSrc("next-env.d.ts");
    await moveToSrc("pages");
    await moveToSrc("public");
    rimraf.sync(path.join(targetDir, "styles"));
    await commitFiles();
  };

// type Mode = "all" | "frontend" | "backend" | "web" | "desktop";
  if (separate) {

  } else {
    await createNextAppCli(wdir, { position: "alone" });
    const pkg = await getPackageJson(wdir, { appName });
    pkg.version = "0.0.0-alpha.0";
    const ignores = [
      "node_modules",
      "/.*",
      distDir,
      nextDistDir,
      nexpressDir,
      nextronDir,
      nexpressDistDir,
      mainDistDir,
      rendererDistDir
    ].filter(item => !item.startsWith(".")).map(item => `"${item}"`).join(", ");
    await replaceTexts(path.join(wdir, "tsconfig.json"), [
      { anchor: "\"node_modules\"", text: ignores },
    ]);

    const deps: Array<string> = ["@bizhermit/basic-utils"];
    const devDeps: Array<string> = ["rimraf"];
    let hasDesktop = false, hasBackend = false, hasFrontend = false;

    // desktop
    if (mode === "desktop" || mode === "all") {
      hasDesktop = true;
      await generateTemplate(wdir, "next-app/desktop");
      await replaceTexts(path.join(wdir, nextronDir, "main.ts"), [
        { anchor: "__appName__", text: appName },
        { anchor: "__srcDir__", text: srcDir },
        { anchor: "__mainDistDir__", text: mainDistDir },
        { anchor: "__rendererDistDir__", text: rendererDistDir },
      ]);
      await replaceTexts(path.join(wdir, nextronDir, "tsconfig.json"), [
        { anchor: "__srcDir__", text: srcDir },
        { anchor: "__mainDistDir__", text: mainDistDir },
      ]);
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
    if (mode === "frontend" || mode === "desktop") {
      await generateTemplate(wdir, "next-app/backend");
      rimraf.sync(path.join(wdir, nexpressDir));
      if (hasDesktop) await generateTemplate(wdir, "next-app/backend-desktop");
    } else {
      hasBackend = true;
      await generateTemplate(wdir, "next-app/backend");
      if (hasDesktop) await generateTemplate(wdir, "next-app/backend-desktop");
      await replaceTexts(path.join(wdir, nexpressDir, "main.ts"), [
        { anchor: "__appName__", text: appName },
        { anchor: "__srcDir__", text: srcDir },
      ]);
      await replaceTexts(path.join(wdir, nexpressDir, "tsconfig.json"), [
        { anchor: "__nexpressDistDir__", text: nexpressDistDir },
      ]);
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

    // api
    await generateTemplate(wdir, "next-app/api");

    if (mode === "backend") {
      pkg.scripts = {
        "build": "npx next build",
      };
    } else {
      pkg.scripts = {
        "dev": "npx next dev -p 3000",
        "build": "npx next build",
        "next": "npm run build && npx next start -p 3000",
        "export": `npx rimraf ${distDir}/${distNextDir} && npm run build && npx next export -o ${distDir}/${distNextDir}`,
      };
    }
    if (hasFrontend) {
      pkg.scripts = {
        ...pkg.scripts,
      };
    }
    if (hasBackend) {
      pkg.scripts = {
        ...pkg.scripts,
        "nexpress": `npx rimraf ${nextDistDir} && npm run prestart && node ${nexpressDistDir}/main.js -d`,
        "prestart": `npx rimraf ${nexpressDistDir} && npx tsc -p ${nexpressDir}/tsconfig.json`,
        "start": `npm run build && node ${nexpressDistDir}/main.js`,
      };
    }

    if (hasDesktop) {
      pkg.scripts = {
        ...pkg.scripts,
        "clean:nextron": `npx rimraf ${mainDistDir} ${rendererDistDir} ${distDir}/${distPackDir}`,
        "nextron": `npx rimraf ${nextDistDir} && npm run pre_pack && npx electron ${mainDistDir}/${nextronDir}/main.js`,
        "pre_dist": `npm run clean:nextron && npx tsc -p ${nextronDir}/tsconfig.json`,
        "_dist": `npm run build && npx next export -o ${rendererDistDir} && npx minifier ${mainDistDir} && npx minifier ${rendererDistDir} && npx electron-builder`,
        "dist:linux": "npm run _dist -- --linux & npm run clean:nextron",
        "dist:win": "npm run _dist -- --win & npm run clean:nextron",
        "dist:mac": "npm run _dist -- --mac & npm run clean:nextron",
        "pack": `npm run _dist -- --dir --${platform} & npm run clean:nextron`
      };

      const faviconPath = `${srcDir}/public/favicon.ico`;
      pkg.build = {
        "appId": `example.${appName}`,
        "productName": appName,
        "asar": true,
        "extends": null,
        "extraMetadata": {
          "main": `${mainDistDir}/${nextronDir}/main.js`,
        },
        "files": [
          `!${srcDir}`,
          `!${nextronDir}`,
          `!${nexpressDir}`,
          `${mainDistDir}/**/*`,
          `${rendererDistDir}/**/*`,
          `${srcDir}/public`,
        ],
        "extraFiles": [{
          "from": "resources/**",
          "to": "resources",
          "filter": [
            "**/*",
            "!config.json",
          ]
        }, {
          "from": "LICENSE",
          "to": "LICENSE",
        }, {
          "from": "CREDIT",
          "to": "CREDIT",
        }],
        "directories": {
          "output": `${distDir}/${distPackDir}`,
        },
        "win": {
          "icon": faviconPath,
          "target": {
            "target": "nsis",
            "arch": [
              "x64"
            ],
          },
        },
        "mac": {
          "icon": faviconPath,
          "target": "dmg"
        },
        "linux": {
          "icon": faviconPath,
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
          "installerIcon": faviconPath,
          "installerHeaderIcon": faviconPath,
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
          "clean": `npx rimraf ${distDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "backend":
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "frontend":
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "web":
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      default:
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
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