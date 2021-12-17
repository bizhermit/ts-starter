"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,n,s){void 0===s&&(s=n),Object.defineProperty(e,s,{enumerable:!0,get:function(){return t[n]}})}:function(e,t,n,s){void 0===s&&(s=n),e[s]=t[n]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&__createBinding(t,e,n);return __setModuleDefault(t,e),t},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.create_web_desktop=exports.create_desktop=exports.create_web=exports.create_cli=exports.create_homepage=void 0;const path_1=__importDefault(require("path")),fse=__importStar(require("fs-extra")),cp=__importStar(require("child_process")),rimraf=__importStar(require("rimraf")),simple_git_1=__importDefault(require("simple-git")),getPackageJson=e=>{let t={};try{t=require(path_1.default.join(e,"package.json"))}catch{process.stdout.write("create package.json\n"),fse.writeFileSync(path_1.default.join(e,"package.json"),JSON.stringify(t,null,2)),t.dependencies={},t.devDependencies={}}return t.name=t.name||path_1.default.basename(e),t.version="0.0.0",t.description="",t.scripts={},t.repository=t.repository??{type:"git",ulr:""},t.bugs=t.bugs||"",t.author=t.author||"",t.contributors=t.contributors??[],t.private=!0,t.license="MIT",t},savePackageJson=(e,t)=>{const n={},s=["name","version","description","repository","bugs","author","homepage","contributors","license","private","main","bin","files","scripts","dependencies","devDependencies","build","browser"];for(const e of s)e in t&&(n[e]=t[e]);Object.keys(t).forEach((e=>{e in n||(n[e]=t[e])})),fse.writeFileSync(path_1.default.join(e,"package.json"),JSON.stringify(n,null,2))},npmInstall=(e,t=[],n=[])=>{if(process.stdout.write("npm install...\n"),t.length>0){process.stdout.write("dependencies\n");for(const e of t)process.stdout.write(` - ${e}\n`);cp.spawnSync("npm",["i","--legacy-peer-deps",...t],{shell:!0,stdio:"inherit",cwd:e})}if(n.length>0){process.stdout.write("devDependencies\n");for(const e of n)process.stdout.write(` - ${e}\n`);cp.spawnSync("npm",["i","--save-dev",...n],{shell:!0,stdio:"inherit",cwd:e})}cp.spawnSync("npm",["audit"],{shell:!0,stdio:"inherit",cwd:e})},getGit=e=>(0,simple_git_1.default)({baseDir:e,binary:"git"}),moveItemToSrc=(e,t)=>{try{fse.moveSync(path_1.default.join(e,t),path_1.default.join(e,"src",t))}catch{process.stderr.write(`file or dir move failed: ${t}\n`)}},cloneFiles=async(e,t,n)=>{const s=path_1.default.join(e,"_clone");await getGit(e).clone(t,s);try{await n(s)}catch(e){process.stderr.write("clone process failed.\n"),process.stderr.write(String(e))}rimraf.sync(s)},moveItemsCloneToDir=(e,t,n)=>{for(const s of t)try{fse.moveSync(path_1.default.join(e,"_clone",s),path_1.default.join(e,s),{overwrite:n??!0})}catch{process.stderr.write(`file or dir move failed: ${s}\n`)}},create_homepage=async e=>{const t=getPackageJson(e);t.scripts={start:"npx react-scripts start",build:"npx rimraf build && npx react-scripts build && npx license-checker --production > build/LICENSE",test:"npx react-scripts test",eject:"npx react-scripts eject"},t.eslintConfig={extends:["react-app","react-app/jest"]},t.browserslist={production:[">0.2%","not dead","not op_mini all"],development:["last 1 chrome version","last 1 firefox version","last 1 safari version"]},savePackageJson(e,t),npmInstall(e,["react","react-dom","react-router-dom","styled-components","web-vitals"],["@types/node","@types/react","@types/react-dom","@types/styled-components","license-checker","node-sass","react-scripts","rimraf","typescript"]),await cloneFiles(e,"https://github.com/bizhermit/clone-homepage.git",(async()=>{moveItemsCloneToDir(e,["src","public",".gitignore","README.md","tsconfig.json"])}))};exports.create_homepage=create_homepage;const create_cli=async e=>{const t=getPackageJson(e);t.main="bin/cli.js",t.bin="bin/cli.js",t.scripts={dev:"npx tsc -w -p src",build:"npx rimraf bin && npx tsc -p src && npx license-checker --production > LICENSE",pack:"npx rimraf build && npm run build && npx pkg --out-path build --compress GZip bin/cli.js"},t.files=["bin"],savePackageJson(e,t),npmInstall(e,[],["@types/node","license-checker","pkg","typescript","rimraf"]),await cloneFiles(e,"https://github.com/bizhermit/clone-cli-app.git",(async()=>{moveItemsCloneToDir(e,["src","README.md",".gitignore"])}))};exports.create_cli=create_cli;const create_nextApp=async e=>{cp.spawnSync("npx",["create-next-app","--ts","."],{shell:!0,stdio:"inherit",cwd:e}),fse.mkdirSync(path_1.default.join(e,"src")),rimraf.sync(path_1.default.join(e,"pages")),rimraf.sync(path_1.default.join(e,"public")),rimraf.sync(path_1.default.join(e,"styles")),moveItemToSrc(e,"next-env.d.ts"),moveItemToSrc(e,"tsconfig.json"),moveItemToSrc(e,".eslintrc.json")},packageJsonScripts_web={"clean:next":"npx rimraf main src/.next src/out",server:"npm run clean:next && npx tsc -p src-nexpress && node main/index.js -dev",start:"npm run clean:next && npx tsc -p src-nexpress && npx tsc -p src && npx next build src && node main/index.js"},packageJsonScripts_desktop=e=>({"clean:next":"npx rimraf main src/.next src/out",electron:"npm run clean:next && npx tsc -p src-nextron && npx electron main/src-nextron/index.js","pack:win":"npm run clean:next && npx rimraf build && npx license-checker --production > LICENSE && npx next build src && npx next export src && npx tsc -p src-nextron && electron-builder --win --dir",pack:"npm run pack:win","confirm:win":`npm run pack:win && .\\build\\win-unpacked\\${e}.exe`,confirm:"npm run confirm:win","build:win":"npx rimraf build && npx license-checker --production > LICENSE && npx next build src && npx next export src && npx tsc -p src-nextron && electron-builder --win",build:"npm run build:win"}),packageJsonDesktopBuild=e=>({appId:`com.seekones.${e}`,productName:e,asar:!0,extends:null,extraMetadata:{main:"main/src-electron/index.js"},files:["main","src/out"],extraFiles:[{from:"LICENSE",to:"LICENSE"},{from:"src/i18n.json",to:"resources/i18n.json"}],directories:{output:"build"},win:{icon:"src/public/favicon.ico",target:{target:"nsis",arch:["x64"]}},mac:{},linux:{},nsis:{oneClick:!1,allowToChangeInstallationDirectory:!0}}),moveItemsWhenNextApp=["src/pages","src/public","src/styles","src/i18n","src/index.d.ts"],create_web=async e=>{create_nextApp(e);const t=getPackageJson(e);t.scripts=packageJsonScripts_web,savePackageJson(e,t),npmInstall(e,["@bizhermit/nexpress"],["@types/node","license-checker","rimraf"]),await cloneFiles(e,"https://github.com/bizhermit/clone-next-app.git",(async t=>{moveItemsCloneToDir(e,[...moveItemsWhenNextApp,"src-nexpress",".gitignore"]),fse.moveSync(path_1.default.join(t,"README.web.md"),path_1.default.join(e,"README.md"),{overwrite:!0})}))};exports.create_web=create_web;const create_desktop=async e=>{create_nextApp(e);const t=getPackageJson(e);t.scripts=packageJsonScripts_desktop(path_1.default.basename(e)),t.build=packageJsonDesktopBuild(path_1.default.basename(e)),t.browser={fs:!1,path:!1},savePackageJson(e,t),npmInstall(e,["@bizhermit/nextron"],["@types/node","electron","electron-builder","license-checker","rimraf"]),await cloneFiles(e,"https://github.com/bizhermit/clone-next-app.git",(async t=>{moveItemsCloneToDir(e,[...moveItemsWhenNextApp,"src-nextron",".gitignore"]),fse.moveSync(path_1.default.join(t,"README.desktop.md"),path_1.default.join(e,"README.md"),{overwrite:!0})}))};exports.create_desktop=create_desktop;const create_web_desktop=async e=>{create_nextApp(e);const t=getPackageJson(e);t.scripts={...packageJsonScripts_web,...packageJsonScripts_desktop(path_1.default.basename(e))},t.build=packageJsonDesktopBuild(path_1.default.basename(e)),t.browser={fs:!1,path:!1},savePackageJson(e,t),npmInstall(e,["@bizhermit/nexpress","@bizhermit/nextron"],["@types/node","electron","electron-builder","license-checker","rimraf"]),await cloneFiles(e,"https://github.com/bizhermit/clone-next-app.git",(async t=>{moveItemsCloneToDir(e,[...moveItemsWhenNextApp,"src-nexpress","src-nextron",".gitignore"]),fse.moveSync(path_1.default.join(t,"README.wd.md"),path_1.default.join(e,"README.md"),{overwrite:!0})}))};exports.create_web_desktop=create_web_desktop;