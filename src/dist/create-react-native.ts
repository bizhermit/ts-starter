import { spawnSync } from "child_process";
import { move, readdir, rename } from "fs-extra";
import path from "path";
import rimraf from "rimraf";
import { ArgsOptions, getPackageJson, savePackageJson } from "./common";

const createReactNative = async (wdir: string, options?: ArgsOptions) => {
  const appName = path.basename(wdir);
  spawnSync("npx", ["react-native", "init", appName, "--template", "react-native-template-typescript"], { shell: true, stdio: "inherit", cwd: wdir });
  const renamedAppDirname = `__${appName}`;
  const renamedAppDirnamePath = path.join(wdir, renamedAppDirname);
  await rename(path.join(wdir, appName), renamedAppDirnamePath);
  const items = await readdir(renamedAppDirnamePath);
  for await (const item of items) {
    await move(path.join(renamedAppDirnamePath, item), path.join(wdir, item));
  }
  rimraf.sync(renamedAppDirnamePath);

  const pkg = await getPackageJson(wdir);
  pkg.version = "0.0.0-alpha.0";
  await savePackageJson(wdir, pkg);
};
export default createReactNative;