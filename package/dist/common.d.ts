export declare type ArgsOptions = {
    appName?: string;
};
export declare const analyzeArgsOptions: (wdir: string, options?: ArgsOptions) => {
    appName: string;
    platform: string;
};
export declare const getPackageJson: (wdir: string, options?: {
    preventInit?: boolean;
    clearScripts?: boolean;
    allowNotFoundNpmPackage?: boolean;
    license?: "MIT";
} & ArgsOptions) => Promise<{
    [key: string]: any;
}>;
export declare const savePackageJson: (wdir: string, pkg: {
    [key: string]: any;
}) => Promise<void>;
export declare const installLibs: (wdir: string, args?: Array<string>, devArgs?: Array<string>, options?: {
    audit?: boolean;
}) => void;
export declare const getTemplateBaseDirname: () => string;
export declare const generateTemplate: (wdir: string, templateName: string, options?: {
    destDir?: string;
}) => Promise<void>;
export declare const removeGit: (wdir: string) => void;
export declare const npmPackageInit: (wdir: string) => void;
export declare const __appName__ = "__appName__";
export declare const replaceAppName: (filePath: string, appName: string) => Promise<boolean>;
export declare const replaceTexts: (filePath: string, replaces: Array<{
    anchor: string;
    text: string;
}>) => Promise<boolean>;
export declare const createEnv: (wdir: string, lines?: Array<string>) => Promise<void>;
