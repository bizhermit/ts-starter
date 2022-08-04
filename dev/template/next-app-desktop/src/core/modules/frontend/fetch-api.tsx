import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import electronAccessor from "../electron-accessor";

const electron = electronAccessor();

const impl = async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
  const isHttp = url.startsWith("http");
  if (isHttp) {
    if (options?.method === "GET") {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`fetchData failed: ${url}`);
      return await res.json() as T;
    }
    const opts: RequestInit = { ...options };
    if (StringUtils.isEmpty(opts.method)) opts.method = "POST";
    opts.headers = { "Content-Type": "application/json", ...opts.headers };
    if (opts.body == null) opts.body = JSON.stringify(params ?? {});
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`fetchData failed: ${url}`);
    return await res.json() as T;
  }
  return await electron.fetch(url, params ?? {}, options) as T;
};

const fetchApi = async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
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