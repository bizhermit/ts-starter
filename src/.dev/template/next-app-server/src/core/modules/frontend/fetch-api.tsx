import StringUtils from "@bizhermit/basic-utils/dist/string-utils";

const basePath = process.env.NEXT_PUBLIC_APP_BASE_PATH;

const impl = async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
  const isHttp = url.startsWith("http");
  const fetchUrl = isHttp ? url : `${global.origin}${`${basePath}/api/${url}`.replace(/\/\//g, "/")}`;
  if (options?.method === "GET") {
    const res = await fetch(fetchUrl, options);
    if (!res.ok) throw new Error(`fetchData failed: ${fetchUrl}`);
    return await res.json() as T;
  }
  const opts: RequestInit = { ...options };
  if (StringUtils.isEmpty(opts.method)) opts.method = "POST";
  opts.headers = { "Content-Type": "application/json", ...opts.headers };
  if (opts.body == null) opts.body = JSON.stringify(params ?? {});
  const res = await fetch(fetchUrl, opts);
  if (!res.ok) throw new Error(`fetchData failed: ${fetchUrl}`);
  return await res.json() as T;
};

const fetchApi = async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
  const ret = await impl<{ data: T; messages: Array<Message>; }>(url, params, options);
  const messages = Array.isArray(ret.messages) ? ret.messages : [];
  return {
    data: ret.data,
    messages,
    hasInformation: () => messages.some(item => item.type === "info"),
    hasWarning: () => messages.some(item => item.type === "warning"),
    hasError: () => messages.some(item => item.type === "error"),
  } as FetchApiResponse<T>;
};
export default fetchApi;