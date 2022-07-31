declare const createNextApp: (wdir: string, options?: {
    server?: boolean;
    desktop?: boolean;
}) => Promise<void>;
export default createNextApp;
