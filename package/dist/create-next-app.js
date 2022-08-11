"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const child_process_1=require("child_process"),fs_extra_1=require("fs-extra"),path_1=__importDefault(require("path")),rimraf_1=__importDefault(require("rimraf")),common_1=require("./common"),createNextApp=async(e,t)=>{const s=path_1.default.basename(e);(0,child_process_1.spawnSync)("npx",["create-next-app","--ts","."],{shell:!0,stdio:"inherit",cwd:e}),await(0,fs_extra_1.mkdir)(path_1.default.join(e,"src")),rimraf_1.default.sync(path_1.default.join(e,"pages")),rimraf_1.default.sync(path_1.default.join(e,"public")),rimraf_1.default.sync(path_1.default.join(e,"styles")),await(0,fs_extra_1.move)(path_1.default.join(e,".eslintrc.json"),path_1.default.join(e,"src",".eslintrc.json")),await(0,fs_extra_1.move)(path_1.default.join(e,"next-env.d.ts"),path_1.default.join(e,"src","next-env.d.ts")),await(0,fs_extra_1.move)(path_1.default.join(e,"tsconfig.json"),path_1.default.join(e,"src","tsconfig.json"));const r=path_1.default.join(e,".gitignore");let a=(await(0,fs_extra_1.readFile)(r)).toString();a=a.replace("/.next/","/src/.next/").replace("/out/","/src/out/"),a+="\n# @bzihermit/starter";const n=e=>{e.forEach((e=>{a+=`\n${e}`}))};n(["/.vscode","/main"]),t?.desktop&&n(["/resources/config.json"]),await(0,fs_extra_1.writeFile)(r,a);const i=["@bizhermit/react-sdk","@bizhermit/basic-utils"],c=["@bizhermit/license","@bizhermit/minifier","@types/node","rimraf"],o=await(0,common_1.getPackageJson)(e,{clearScripts:!0});o.version="0.0.0-alpha.0",o.scripts={clean:"npx rimraf main src/.next src/out","license-check":"npx rimraf CREDIT && npx license -o CREDIT --returnError -exclude caniuse-lite",test:"npx next lint src"},t?.server&&(o.scripts={...o.scripts,server:"npm run clean && npx tsc -p src-server/tsconfig.json && node main/src-server/index.js -dev",build:"npm run license-check && npm run clean && npx tsc -p src-server/tsconfig.json && npx minifier main && npx next build src",start:"node main/src-server/index.js"},i.push("express"),i.push("express-session"),i.push("helmet"),c.push("@types/express"),c.push("@types/express-session")),t?.desktop&&(o.scripts={...o.scripts,desktop:"npm run clean && npx tsc -p src-desktop/tsconfig.json && npx electron main/src-desktop/index.js",_pack:`npm run license-check && npm run clean && npx rimraf build && npx tsc -p src-desktop/tsconfig.json && npx minifier main ${t?.server?"&& set APP_BASE_PATH= ":""}&& npx next build src && npx next export src && electron-builder --dir`,"pack:win":"npm run _pack -- --win"},o.build={appId:`example.${s}`,productName:s,asar:!0,extends:null,extraMetadata:{main:"main/src-desktop/index.js"},files:["main","src/out","src/public"],extraFiles:[{from:"LICENSE",to:"LICENSE"},{from:"CREDIT",to:"CREDIT"}],directories:{output:"build"},win:{icon:"src/public/favicon.ico",target:{target:"nsis",arch:["x64"]}},mac:{},linux:{},nsis:{oneClick:!1,allowToChangeInstallationDirectory:!0}},o.browser={fs:!1,path:!1},i.push("electron-is-dev"),i.push("electron-next"),i.push("fs-extra"),c.push("electron"),c.push("electron-builder"),c.push("@types/fs-extra")),await(0,common_1.savePackageJson)(e,o),(0,common_1.installLibs)(e,i,c),await(0,common_1.generateTemplate)(e,"next-app");const p=async e=>{let t=(await(0,fs_extra_1.readFile)(e)).toString();t=t.replace(/__appName__/g,s),await(0,fs_extra_1.writeFile)(e,t)};await p(path_1.default.join(e,"next.config.js")),t?.server&&await p(path_1.default.join(e,"src-server","index.ts")),t?.desktop&&await p(path_1.default.join(e,"src-desktop","index.ts")),t?.server||(await(0,common_1.generateTemplate)(e,"next-app-desktop"),rimraf_1.default.sync(path_1.default.join(e,"src-server"))),t?.desktop||(await(0,common_1.generateTemplate)(e,"next-app-server"),rimraf_1.default.sync(path_1.default.join(e,"src-desktop")),rimraf_1.default.sync(path_1.default.join(e,"src/modules/electron-accessor.ts")),rimraf_1.default.sync(path_1.default.join(e,"src/modules/frontend/use-electron.ts"))),await(0,fs_extra_1.mkdir)(path_1.default.join(e,"src/core/components"),{recursive:!0}),await(0,fs_extra_1.mkdir)(path_1.default.join(e,"src/modules/frontend"),{recursive:!0}),await(0,fs_extra_1.mkdir)(path_1.default.join(e,"src/modules/backend"),{recursive:!0}),await(0,fs_extra_1.mkdir)(path_1.default.join(e,"src/styles"),{recursive:!0}),(0,common_1.removeGit)(e)};exports.default=createNextApp;