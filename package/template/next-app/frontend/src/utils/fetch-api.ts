import isServer from "./is-server";
import { getCookie } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";

const isDev = process.env.NODE_ENV === "development";
const apiProtocol = process.env.API_PROTOCOL;
const apiHostName = process.env.API_HOST_NAME;
const apiPort = process.env.API_PORT;
const apiBasePath = process.env.API_BASE_PATH;

type Options = {
  req?: IncomingMessage;
  res?: ServerResponse;
  useFormData?: boolean;
  api?: boolean;
};

const assembleUri = (url: string, queryParams?: Struct, options?: Options) => {
  const isHttp = url.startsWith("http");
  let uri = "";
  if (isHttp) {
    uri = url;
  } else {
    let origin = "";
    if (isServer) {
      const hostname = options?.req?.headers.host?.split(":") ?? [];
      origin = `${apiProtocol || (isDev ? "http:" : "https:")}//${apiHostName || hostname[0] || "localhost"}`;
      const port = apiPort || hostname[1];
      if (port) origin += `:${port}`;
    } else {
      if (apiProtocol) {
        origin = `${apiProtocol}//${apiHostName || "localhost"}`;
        if (apiPort) origin += `:${apiPort}`;
      } else if (apiHostName) {
        origin = `${window.location.protocol}//${apiHostName}`;
        if (apiPort) origin += `:${apiPort}`;
      } else if (apiPort) {
        origin = `${window.location.protocol}//${window.location.hostname}:${apiPort}`;
      }
    }
    uri = `${origin}${apiBasePath || ""}${options?.api === false ? "" : "/api"}${url.startsWith("/") ? url : `/${url}`}`;
  }
  if (queryParams) {
    const query: Array<string> = [];
    Object.keys(queryParams).forEach(key => {
      const val = queryParams[key];
      if (val == null) return;
      if (Array.isArray(val)) {
        val.forEach(v => {
          if (v == null) return;
          query.push(`${key}=${v}`);
        });
        return;
      }
      query.push(`${key}=${val}`);
    });
    if (query.length > 0) {
      uri += "?" + query.join("&");
    }
  }
  return encodeURI(uri);
};

const convertResponseToData = async <T extends Struct | string = Struct>(res: Response): Promise<FetchResponse<T>> => {
  if (!res.ok) {
    return {
      data: undefined as unknown as T,
      messages: [{
        title: "System Error",
        body: `${res.status} | ${res.statusText}`,
        type: "error",
      }],
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
  }
  let data: T, messages: Array<Message> = [];
  if (res.status === 204) {
    data = undefined as unknown as T;
  } else {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      data = json.data as T,
      messages = Array.isArray(json.messages) ? json.messages : [];
    } catch {
      data = text as T;
    }
  }
  return {
    data,
    messages,
    ok: !messages.some(msg => msg.type === "error"),
    status: res.status,
    statusText: res.statusText,
  };
};

const catchError = <T extends Struct | string = Struct>(_error: any) => {
  // console.log(error);
  return {
    data: undefined as unknown as T,
    messages: [{
      title: "System Error",
      body: "fetch error.",
      type: "error",
    }],
    ok: false,
    status: -1,
    statusText: "fetch error.",
  } as FetchResponse<T>;
};

const fetchImpl = async <T extends Struct | string = Struct>(method: string = "POST", url: string, params?: Struct, options?: Options) => {
  try {
    const isGet = method === "GET";
    const requestInit: RequestInit = {
      method,
      headers: {
        ...(isGet || options?.useFormData ? {} : { "Content-Type": "application/json" }),
        "CSRF-Token": (() => {
          const token = getCookie("XSRF-TOKEN", { req: options?.req, res: options?.res });
          if (typeof token === "string") return token;
          return "";
        })(),
      },
      credentials: "include",
      body: isGet ? undefined : (options?.useFormData ? (() => {
        const formData = new FormData();
        if (params) {
          Object.keys(params).forEach(key => {
            formData.append(key, JSON.stringify(params[key]));
          });
        }
        return formData;
      })() : JSON.stringify(params)),
    };
    const uri = assembleUri(url, isGet ? params : undefined, options);
    return convertResponseToData<T>(await fetch(uri, requestInit));
  } catch (e) {
    return catchError<T>(e);
  }
};

const fetchApi = {
  exec: fetchImpl,
  get: async <T extends Struct | string = Struct>(url: string, params?: Struct, options?: Options) => {
    return fetchImpl<T>("GET", url, params, options);
  },
  post: async <T extends Struct | string = Struct>(url: string, params?: Struct, options?: Options) => {
    return fetchImpl<T>("POST", url, params, options);
  },
  put: async <T extends Struct | string = Struct>(url: string, params?: Struct, options?: Options) => {
    return fetchImpl<T>("PUT", url, params, options);
  },
  delete: async <T extends Struct | string = Struct>(url: string, params?: Struct, options?: Options) => {
    return fetchImpl<T>("DELETE", url, params, options);
  },
};

export default fetchApi;