import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { spawnSync } from "child_process";
import { copy, existsSync, move, readFile, writeFile } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, getTemplateBaseDirname, installLibs, removeGit, replaceAppName, replaceTexts, savePackageJson, __appName__ } from "./common";

type Mode = "all" | "frontend" | "backend" | "web" | "desktop";

const createNextApp = async (wdir: string, mode: Mode = "all", separate = false, options?: ArgsOptions & {
  targetDir?: string;
  apiBasePath?: string;
  addDesktop?: boolean;
  distFlat?: boolean;
}) => {
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

  const desktopDeps = [
    "fs-extra",
    "electron-is-dev",
    "electron-next",
  ];
  const desktopDevDeps = [
    "@bizhermit/minifier",
    "@types/fs-extra",
    "electron",
    "electron-builder",
  ];
  const backendDeps = [
    "dotenv",
    "express",
    "express-session",
    "helmet",
  ];
  const backendDevDeps = [
    "@types/dotenv",
    "@types/express",
    "@types/express-session",
  ];
  const frontendDeps = [
    "@bizhermit/react-addon",
  ];

  const readReadmeFile = async (name: string) => {
    return (await readFile(path.join(getTemplateBaseDirname(), "next-app", name))).toString();
  }
  const addDesktopPackageJsonProperties = (pkg: {[key: string]: any}) => {
    const exportDir = options?.distFlat ? distDir : `${distDir}/${distPackDir}`;
    pkg.scripts = {
      ...pkg.scripts,
      "clean:nextron": `npx rimraf ${mainDistDir} ${rendererDistDir}`,
      "nextron": `npx rimraf ${nextDistDir} && npm run predist && npx electron ${mainDistDir}/${nextronDir}/main.js`,
      "predist": `npm run clean:nextron -- ${exportDir} && npx tsc -p ${nextronDir}/tsconfig.json`,
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
        "output": `${exportDir}`,
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
  };

  if ((mode === "all" || mode === "web") ? separate : false) {
    const addDesktop = mode === "all";
    const frontendDir = "frontend";
    const backendDir = "backend";
    await createNextApp(wdir, frontendDir, false, {
      appName: `${appName}-frontend`,
      targetDir: frontendDir,
      apiBasePath: addDesktop ? `${appName}-backend` : undefined,
      addDesktop,
      distFlat: true,
    });
    await createNextApp(wdir, backendDir, false, {
      appName: `${appName}-backend`,
      targetDir: backendDir,
      addDesktop, 
    });

    const deps: Array<string> = [];
    const devDeps: Array<string> = [];
    const gitIgnoreLines = (await readFile(path.join(wdir, frontendDir, ".gitignore"))).toString().split(/\n/g);
    gitIgnoreLines.splice(gitIgnoreLines.indexOf("# develop") - gitIgnoreLines.length + 1);
    gitIgnoreLines.push(
      ".vscode/settings.json",
      `/${frontendDir}/${distDir}/`,
      `${nextDistDir}`,
      `${nexpressDistDir}`,
    );
    const pkg = await getPackageJson(wdir, { appName });

    if (addDesktop) {
      await generateTemplate(wdir, "next-app/desktop");
      await replaceTexts(path.join(wdir, nextronDir, "main.ts"), [
        { anchor: __appName__, text: appName },
        { anchor: __srcDir__, text: `${frontendDir}/${srcDir}` },
        { anchor: __mainDistDir__, text: `${mainDistDir}` },
        { anchor: __rendererDistDir__, text: `${frontendDir}/${rendererDistDir}` },
      ]);
      await replaceTexts(path.join(wdir, nextronDir, "tsconfig.json"), [
        { anchor: __srcDir__, text: `${frontendDir}/${srcDir}` },
        { anchor: __mainDistDir__, text: `../${mainDistDir}` },
      ]);
      deps.push(...desktopDeps);
      devDeps.push(
        ...desktopDevDeps,
        "rimraf"
      );
      gitIgnoreLines.push(
        `${mainDistDir}`,
        `${rendererDistDir}`,
        `${frontendDir}/resources/config.json`,
      );
      addDesktopPackageJsonProperties(pkg);
    } else {
      pkg.scripts = {
        "frontend": `cd ${frontendDir} && npm run dev`,
        "backend": `cd ${backendDir} && npm run nexpress`,
        "dev": "npm run frontend | npm run backend",
        "start:f": `cd ${frontendDir} && npm run next`,
        "start:b": `cd ${backendDir} && npm run start`,
        "start": "npm run start:b | npm run start:f"
      };
    }
    
    await savePackageJson(wdir, pkg);
    installLibs(wdir, deps, devDeps);
    await writeFile(path.join(wdir, ".gitignore"), gitIgnoreLines.join("\n"));
    removeGit(wdir);
    return;
  }

  const targetDir = path.join(wdir, options?.targetDir ?? "");

  spawnSync("npx", ["create-next-app", targetDir, "--ts", "--use-npm"], { shell: true, stdio: "inherit", cwd: wdir });
  const configFilePath = path.join(targetDir, "next.config.js");
  const configLines = (await readFile(configFilePath)).toString().split(/\n|\r\n/g);
  const endStructIndex = configLines.findIndex(line => line.match(/^}(;|\s)*$/)) ?? 1;
  if (!configLines[endStructIndex - 1].match(/,$/)) {
    configLines[endStructIndex - 1] = configLines[endStructIndex - 1] + ",";
  }
  let configAddLines: Array<string> = [];
  let envLines: Array<string> = [];

  const gitignorePath = path.join(targetDir, ".gitignore");
  let gitignoreContent = (await readFile(gitignorePath)).toString();
  gitignoreContent = gitignoreContent.replace("/.next/", `/${nextDistDir}/`);
  gitignoreContent += `\n# develop`;
  const addGitignoreContents = (lines: Array<string>) => {
    lines.forEach(line => {
      gitignoreContent += `\n${line}`;
    });
  };
  addGitignoreContents(["/.vscode/settings.json", `/${distDir}/`]);

  const moveToSrc = async (fileName: string) => {
    const srcFilePath = path.join(targetDir, fileName);
    if (!existsSync(srcFilePath)) return;
    await move(srcFilePath, path.join(targetDir, srcDir, fileName), { overwrite: true });
  };
  await moveToSrc("next-env.d.ts");
  await moveToSrc("pages");
  await moveToSrc("public");
  rimraf.sync(path.join(targetDir, "styles"));

  const pkg = await getPackageJson(targetDir, { appName });
  pkg.name = appName;
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
    await generateTemplate(targetDir, "next-app/desktop");
    await replaceTexts(path.join(targetDir, nextronDir, "main.ts"), [
      { anchor: __appName__, text: appName },
      { anchor: __srcDir__, text: srcDir },
      { anchor: __mainDistDir__, text: mainDistDir },
      { anchor: __rendererDistDir__, text: rendererDistDir },
    ]);
    await replaceTexts(path.join(targetDir, nextronDir, "tsconfig.json"), [
      { anchor: __srcDir__, text: srcDir },
      { anchor: __mainDistDir__, text: mainDistDir },
    ]);
    deps.push(...desktopDeps);
    devDeps.push(...desktopDevDeps);
  }

  // backend
  if (mode === "frontend" || mode === "desktop") {
    await generateTemplate(targetDir, "next-app/backend");
    rimraf.sync(path.join(targetDir, nexpressDir));
    if (hasDesktop || options?.addDesktop) await generateTemplate(targetDir, "next-app/backend-desktop");
  } else {
    hasBackend = true;
    await generateTemplate(targetDir, "next-app/backend");
    if (hasDesktop || options?.addDesktop) await generateTemplate(targetDir, "next-app/backend-desktop");
    await replaceTexts(path.join(targetDir, nexpressDir, "main.ts"), [
      { anchor: __appName__, text: appName },
      { anchor: __srcDir__, text: srcDir },
    ]);
    await replaceTexts(path.join(targetDir, nexpressDir, "tsconfig.json"), [
      { anchor: __nexpressDistDir__, text: nexpressDistDir },
    ]);
    deps.push(...backendDeps);
    devDeps.push(...backendDevDeps);
  }

  // frontend
  if (mode !== "backend") {
    hasFrontend = true;
    await generateTemplate(targetDir, "next-app/frontend");
    if (hasDesktop || options?.addDesktop) await generateTemplate(targetDir, "next-app/frontend-desktop");
    deps.push(...frontendDeps);
  }

  // api
  await generateTemplate(targetDir, "next-app/api");

  if (mode === "backend") {
    pkg.scripts = {
      "build": "npx next build",
    };
  } else {
    tsConfigExcludes.push(distDir);
    const exportDir = options?.distFlat ? distDir : `${distDir}/${distNextDir}`;
    pkg.scripts = {
      "dev": "npx next dev -p 3000",
      "build": "npx next build",
      "next": "npm run build && npx next start -p 80",
      "export": `npx rimraf ${exportDir} && npm run build && npx next export -o ${exportDir}`,
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
    addGitignoreContents([
      `/${nexpressDistDir}/`,
    ]);

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
    addGitignoreContents([
      `/${mainDistDir}/`,
      `/${rendererDistDir}/`,
      `/resources/config.json`,
    ]);
    addDesktopPackageJsonProperties(pkg);
  }

  configAddLines = [
    `  basePath: process.env.BASE_PATH,`,
    `  env: {`,
    `    BASE_PATH: process.env.BASE_PATH,`,
    `    PORT: process.env.PORT,`,
    `    API_BASE_PATH: process.env.BASE_PATH,`,
    `  }`
  ];
  envLines = [
    `# BASE_PATH=/${appName}`,
    `# PORT=80`,
  ];

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
        "clean": `npx rimraf ${nexpressDistDir} ${nextDistDir} node_modules`,
        ...pkg.scripts,
      };
      break;
    case "frontend":
      appType = "frontend application server"
      pkg.scripts = {
        "clean": `npx rimraf ${distDir} ${nexpressDistDir} ${nextDistDir} node_modules`,
        ...pkg.scripts,
      };
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
      const specifiedApi = StringUtils.isNotEmpty(options?.apiBasePath);
      const envCommentStr = specifiedApi ? "" : "# ";
      envLines = [
        `# BASE_PATH=/${appName}`,
        `${envCommentStr}API_PROTOCOL=${specifiedApi ? "http" : ""}`,
        `${envCommentStr}API_HOST_NAME=${specifiedApi ? "localhost" : ""}`,
        `${envCommentStr}API_PORT=80`,
        `${envCommentStr}API_BASE_PATH=${specifiedApi ? `/${options?.apiBasePath}` : "$BASE_PATH"}`,
      ];
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

  await savePackageJson(targetDir, pkg);

  installLibs(targetDir, deps, devDeps);
  await replaceTexts(path.join(targetDir, "tsconfig.json"), [
    { anchor: "\"node_modules\"", text: [...new Set(tsConfigExcludes)].filter(item => StringUtils.isNotEmpty(item) && !item.startsWith(".")).map(item => `"${item}"`).join(", ") },
  ]);

  configAddLines.filter(line => StringUtils.isNotEmpty(line)).forEach((line, idx) => {
    configLines.splice(endStructIndex + idx, 0, line);
  });

  await writeFile(configFilePath, configLines.join("\n"));
  await writeFile(path.join(targetDir, "..env"), envLines.join("\n"));
  await writeFile(gitignorePath, gitignoreContent);

  await copy(path.join(getTemplateBaseDirname(), "next-app/README.md"), path.join(targetDir, "README.md"));
  await replaceTexts(path.join(targetDir, "README.md"), [
    { anchor: "__APP_TYPE__", text: appType },
    { anchor: "__POWERED_BY__", text: poweredBy.join(", ") },
    { anchor: "__ADDON_README__", text: addonReadme },
  ]);

  await generateTemplate(targetDir, "dev-env/next-app/base");
  await replaceAppName(path.join(targetDir, ".devcontainer/docker-compose.yml"), appName);
  await replaceAppName(path.join(targetDir, ".devcontainer/devcontainer.json"), appName);

  removeGit(targetDir);
};
export default createNextApp;