import StringUtils from "@bizhermit/basic-utils/dist/string-utils";

const nextron = (global as any).nextron as { fetch: any };
const basePath = (document.getElementById("basePath") as HTMLInputElement).value ?? "";

const impl = async <T = {[key: string]: any}>(url: string, params?: {[key: string]: any}, options?: RequestInit) => {
    const isHttp = url.startsWith("http");
    if (nextron == null || isHttp) {
        const fetchUrl = isHttp ? url : `${global.origin}${`${basePath}/api/${url}`.replace(/\/\//g, "/")}`;
        if (options?.method === "GET") {
            const res = await fetch(fetchUrl, options);
            if (!res.ok) throw new Error(`fetchData failed: ${fetchUrl}`);
            return await res.json() as T;
        }
        const opts: RequestInit = {...options};
        if (StringUtils.isEmpty(opts.method)) opts.method = "POST";
        opts.headers = { "Content-Type": "application/json", ...opts.headers };
        if (opts.body == null) opts.body = JSON.stringify(params ?? {});
        const res = await fetch(fetchUrl, opts);
        if (!res.ok) throw new Error(`fetchData failed: ${fetchUrl}`);
        return await res.json() as T;
    }
    return await nextron.fetch(url, params ?? {}, options) as T;
};

const fetchApi = async <T = {[key: string]: any}>(url: string, params?: {[key: string]: any}, options?: RequestInit) => {
    const ret = await impl<{ data: T; messages: Array<Message>; }>(url, params, options);
    const messages = Array.isArray(ret.messages) ? ret.messages : [];
    return {
        data: ret.data,
        messages,
        hasInformation: () => messages.some(item => item.type === "info"),
        hasWarning: () => messages.some(item => item.type === "warn"),
        hasError: () => messages.some(item => item.type === "err"),
    } as FetchApiResponse<T>;
};
export default fetchApi;