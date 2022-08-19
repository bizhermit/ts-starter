import isServer from "./is-server";
import { getCookie } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";

const isDev = process.env.NODE_ENV === "development";
const apiProtocol = process.env.API_PROTOCOL;
const apiHostName = process.env.API_HOST_NAME;
const apiPort = process.env.API_PORT;
const apiBasePath = process.env.API_BASE_PATH;

type GetParamType = string | number | boolean | null | undefined;
type QueryParams = { [key: string]: GetParamType | Array<GetParamType> } | null | undefined;
type Options = {
  req?: IncomingMessage;
  res?: ServerResponse;
  useFormData?: boolean;
  api?: boolean;
};

const assembleUri = (url: string, queryParams?: QueryParams, options?: Options) => {
  const isHttp = url.startsWith("http");
  let uri = "";
  if (isHttp) {
    uri = url;
  } else {
    let origin = "";
    if (isServer) {
      const hostname = options?.req?.headers.host?.split(":") ?? [];
      origin = `${apiProtocol || (isDev ? "http:" : "https:")}//${hostname[0] || apiHostName || "localhost"}`;
      const port = hostname[1] || apiPort;
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

const getToken = (options?: Options) => {
  const token = getCookie("XSRF-TOKEN", { req: options?.req, res: options?.res });
  if (typeof token === "string") return token;
  return "";
};

const toFormData = (params?: Struct) => {
  if (!params) return undefined;
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    formData.append(key, JSON.stringify(params[key]));
  });
  return formData;
};

const toData = <T = Struct>(responseBody: Struct) => {
  const messages: Array<Message> = Array.isArray(responseBody.messages) ? responseBody.messages : [];
  return {
    data: responseBody.data as T,
    messages,
    hasError: () => messages.some(msg => msg.type === "error"),
    hasMessage: () => messages.length > 0
  };
};

type FetchResponseData<T> = {
  data: T;
  messages: Array<Message>
  hasMessage: () => boolean;
  hasError: () => boolean;
};
const convertResponseToData = async <T = Struct>(res: Response): Promise<FetchResponseData<T>> => {
  if (!res.ok) {
    return {
      data: {} as T,
      messages: [{
        title: "System Error",
        body: `${res.status} | ${res.statusText}`,
        type: "error",
      }],
      hasError: () => true,
      hasMessage: () => true,
    };
  }
  if (res.status === 204) return toData({});
  const json = await res.json();
  return toData(json);
};

const fetchApi = {
  get: async <T = Struct>(url: string, params?: QueryParams, options?: Options) => {
    const res = await fetch(assembleUri(url, params, options), {
      method: "GET",
      headers: {
        "CSRF-Token": getToken(options),
      },
    });
    return convertResponseToData<T>(res);
  },
  post: async <T = Struct>(url: string, params?: Struct, options?: Options) => {
    const res = await fetch(assembleUri(url, null, options), {
      method: "POST",
      body: options?.useFormData ? toFormData(params) : JSON.stringify(params),
      headers: {
        ...(options?.useFormData ? {} : { "Content-Type": "application/json" }),
        "CSRF-Token": getToken(options),
      },
    });
    return convertResponseToData<T>(res);
  },
};

export default fetchApi;