declare module "@bizhermit/starter/dist/create-cli" {
  const createCli: typeof import("./dist/create-cli");
  // tslint:disable-next-line:export-just-namespace
  export = createCli;
}
declare module "@bizhermit/starter/dist/create-module" {
  const createModule: typeof import("./dist/create-module");
  // tslint:disable-next-line:export-just-namespace
  export = createModule;
}
declare module "@bizhermit/starter/dist/create-next-app" {
  const createNextApp: typeof import("./dist/create-next-app");
  // tslint:disable-next-line:export-just-namespace
  export = createNextApp;
}
declare module "@bizhermit/starter/dist/create-react-app" {
  const createReactApp: typeof import("./dist/create-react-app");
  // tslint:disable-next-line:export-just-namespace
  export = createReactApp;
}
declare module "@bizhermit/starter/dist/create-react-native" {
  const createReactNative: typeof import("./dist/create-react-native");
  // tslint:disable-next-line:export-just-namespace
  export = createReactNative;
}