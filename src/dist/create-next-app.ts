import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { spawnSync } from "child_process";
import { copy, existsSync, move, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, getTemplateBaseDirname, installLibs, removeGit, replaceTexts, savePackageJson, __appName__ } from "./common";

type Mode = "all" | "frontend" | "backend" | "web" | "desktop";

const createNextApp = async (wdir: string, mode: Mode = "all", separate = false, options?: ArgsOptions) => {
  const { appName, platform } = analyzeArgsOptions(wdir, options);

  const __srcDir__ = "__srcDir__";
  const srcDir = "src";
  const nexpressDir = "nexpress";
  const nextronDir = "nextron";
  const distDir = "dist";
  const distNextDir = "next";
  const distPackDir = "pack";
  const nextDistDir = ".next";
  const __nexpressDistDir__ = "__nexpressDistDir__";
  const nexpressDistDir = ".nexpress";
  const __mainDistDir__ = "__mainDistDir__";
  const mainDistDir = ".main";
  const __rendererDistDir__ = "__rendererDistDir__";
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
    addGitignoreContents([
      "/.vscode/settings.json",
      `/${nexpressDistDir}/`,
      `/${mainDistDir}/`,
      `/${rendererDistDir}/`,
      `/resources/config.json`,
    ]);
    
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
            `# BASE_PATH=/${appName}`,
            "# API_PROTOCOL=",
            "# API_HOST_NAME=",
            "# API_PORT=80",
            `# API_BASE_PATH=$BASE_PATH`,
          );
          break;
        case "desktop":
          // no env
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
            `# BASE_PATH=/${appName}`,
            `# PORT=80`,
          );
          break;
      }
    }
    configAddLines.filter(line => StringUtils.isNotEmpty(line)).forEach((line, idx) => {
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
  const readReadmeFile = async (name: string) => {
    return (await readFile(path.join(getTemplateBaseDirname(), "next-app", name))).toString();
  }

  if (separate) {
    // TODO:
  } else {
    await createNextAppCli(wdir, { position: "alone" });
    const pkg = await getPackageJson(wdir, { appName });
    pkg.version = "0.0.0-alpha.0";

    const deps: Array<string> = ["@bizhermit/basic-utils"];
    const devDeps: Array<string> = ["rimraf"];
    let hasDesktop = false, hasBackend = false, hasFrontend = false;
    const tsConfigExcludes = [
      "node_modules",
      "/.*",
    ];
    const poweredBy: Array<string> = [`[Next.js](https://nextjs.org/)`];
    let appType = "", addonReadme = "";

    // desktop
    if (mode === "desktop" || mode === "all") {
      hasDesktop = true;
      tsConfigExcludes.push(distDir);
      await generateTemplate(wdir, "next-app/desktop");
      await replaceTexts(path.join(wdir, nextronDir, "main.ts"), [
        { anchor: __appName__, text: appName },
        { anchor: __srcDir__, text: srcDir },
        { anchor: __mainDistDir__, text: mainDistDir },
        { anchor: __rendererDistDir__, text: rendererDistDir },
      ]);
      await replaceTexts(path.join(wdir, nextronDir, "tsconfig.json"), [
        { anchor: __srcDir__, text: srcDir },
        { anchor: __mainDistDir__, text: mainDistDir },
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
        { anchor: __appName__, text: appName },
        { anchor: __srcDir__, text: srcDir },
      ]);
      await replaceTexts(path.join(wdir, nexpressDir, "tsconfig.json"), [
        { anchor: __nexpressDistDir__, text: nexpressDistDir },
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
      tsConfigExcludes.push(distDir);
      pkg.scripts = {
        "dev": "npx next dev -p 3000",
        "build": "npx next build",
        "next": "npm run build && npx next start -p 80",
        "export": `npx rimraf ${distDir}/${distNextDir} && npm run build && npx next export -o ${distDir}/${distNextDir}`,
      };
    }

    if (hasFrontend) {
      addonReadme += await readReadmeFile("README.next.md");
      tsConfigExcludes.push(nextDistDir);
      pkg.scripts = {
        ...pkg.scripts,
      };
    }
    if (hasBackend) {
      poweredBy.push(`[Express](https://expressjs.com/)`);
      addonReadme += await readReadmeFile("README.nexpress.md");
      tsConfigExcludes.push(nexpressDir);
      tsConfigExcludes.push(nexpressDistDir);

      pkg.scripts = {
        ...pkg.scripts,
        "nexpress": `npx rimraf ${nextDistDir} && npm run prestart && node ${nexpressDistDir}/main.js -d`,
        "prestart": `npx rimraf ${nexpressDistDir} && npx tsc -p ${nexpressDir}/tsconfig.json`,
        "start": `npm run build && node ${nexpressDistDir}/main.js`,
      };
    }

    if (hasDesktop) {
      poweredBy.push(`[Electron](https://www.electronjs.org/)`);
      addonReadme += await readReadmeFile("README.nextron.md");
      tsConfigExcludes.push(nextronDir);
      tsConfigExcludes.push(mainDistDir);
      tsConfigExcludes.push(rendererDistDir);

      pkg.scripts = {
        ...pkg.scripts,
        "clean:nextron": `npx rimraf ${mainDistDir} ${rendererDistDir}`,
        "nextron": `npx rimraf ${nextDistDir} && npm run predist && npx electron ${mainDistDir}/${nextronDir}/main.js`,
        "predist": `npm run clean:nextron -- ${distDir}/${distPackDir} && npx tsc -p ${nextronDir}/tsconfig.json`,
        "dist": `npm run build && npx next export -o ${rendererDistDir} && npx minifier ${mainDistDir} && npx minifier ${rendererDistDir} && npx electron-builder`,
        "dist:linux": "npm run dist -- --linux & npm run clean:nextron",
        "dist:win": "npm run dist -- --win & npm run clean:nextron",
        "dist:mac": "npm run dist -- --mac & npm run clean:nextron",
        "pack": `npm run dist -- --dir --${platform} & npm run clean:nextron`
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
          "from": "resources",
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
        appType = "desktop application"
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "backend":
        appType = "backend application server"
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "frontend":
        appType = "frontend application server"
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      case "web":
        appType = "web application server"
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
      default:
        appType = "web & desktop application"
        pkg.scripts = {
          "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${mainDistDir} ${rendererDistDir} ${nextDistDir} node_modules`,
          ...pkg.scripts,
        };
        break;
    }
    await savePackageJson(wdir, pkg);

    installLibs(wdir, deps, devDeps);
    await replaceTexts(path.join(wdir, "tsconfig.json"), [
      { anchor: "\"node_modules\"", text: [...new Set(tsConfigExcludes)].filter(item => StringUtils.isNotEmpty(item) && !item.startsWith(".")).map(item => `"${item}"`).join(", ") },
    ]);

    await copy(path.join(getTemplateBaseDirname(), "next-app/README.md"), path.join(wdir, "README.md"));
    await replaceTexts(path.join(wdir, "README.md"), [
      { anchor: "__APP_TYPE__", text: appType },
      { anchor: "__POWERED_BY__", text: poweredBy.join(", ") },
      { anchor: "__ADDON_README__", text: addonReadme },
    ]);
  }

  removeGit(wdir);
};
export default createNextApp;