import path from "path";
import { analyzeArgsOptions, ArgsOptions, generateTemplate, getPackageJson, installLibs, replaceAppName, savePackageJson } from "./common";

const createReactApp = async (wdir: string, options?: ArgsOptions) => {
  const { appName } = analyzeArgsOptions(wdir, options);

  const pkg = await getPackageJson(wdir, { appName });
  pkg.scripts = {
    "clean": "npx rimraf build",
    "start": "npx react-scripts start",
    "build": "npm run clean && npx react-scripts build",
    "test": "npx react-scripts test",
    "eject": "npx react-scripts eject",
  };
  pkg.eslintConfig = {
    extends: ["react-app", "react-app/jest"]
  };
  pkg.browserslist = {
    production: [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    development: [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ],
  };
  await savePackageJson(wdir, pkg);

  installLibs(wdir, [
    "react",
    "react-dom",
    "react-router-dom",
    "styled-components",
    "web-vitals",
    `@bizhermit/react-addon`,
    `@bizhermit/basic-utils`,
  ], [
    `@bizhermit/license`,
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "@types/styled-components",
    "node-sass",
    "react-scripts",
    "rimraf",
    "typescript",
  ]);
  await generateTemplate(wdir, "react-app");

  await replaceAppName(path.join(wdir, "public", "index.html"), appName);
  await replaceAppName(path.join(wdir, "src/components/pages", "index.tsx"), appName);
  await replaceAppName(path.join(wdir, "src/components", "menu-bar.tsx"), appName);
};
export default createReactApp;