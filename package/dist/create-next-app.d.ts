import { ArgsOptions } from "./common";
declare type Mode = "all" | "frontend" | "backend" | "web" | "desktop";
declare const createNextApp: (wdir: string, mode?: Mode, separate?: boolean, options?: ArgsOptions & {
    targetDir?: string;
    crossBasePath?: string;
    distFlat?: boolean;
    corsOriginPort?: number;
}) => Promise<void>;
export default createNextApp;
