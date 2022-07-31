export declare const getPackageJson: (wdir: string, options?: {
    clearScripts?: boolean;
}) => Promise<{
    [key: string]: any;
}>;
export declare const savePackageJson: (wdir: string, pkg: {
    [key: string]: any;
}) => Promise<void>;
export declare const installLibs: (wdir: string, args?: Array<string>, devArgs?: Array<string>) => void;
export declare const generateTemplate: (wdir: string, templateName: string) => Promise<void>;
export declare const removeGit: (wdir: string) => void;
