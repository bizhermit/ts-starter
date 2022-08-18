import isServer from "./is-server";
import { getCookie } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";

const apiProtocol = process.env.API_PROTOCOL;
const apiHostName = process.env.API_HOST_NAME;
const apiPort = process.env.API_PORT;
const apiBasePath = process.env.API_BASE_PATH;
const electron = (global as any).electron as ElectronAccessor;

type GetParamType = string | number | boolean | null | undefined;
type QueryParams = { [key: string]: GetParamType | Array<GetParamType> } | null;
type Options = {
  req?: IncomingMessage;
  res?: ServerResponse;
  useFormData?: boolean;
};

const assembleUri = (url: string, queryParams?: QueryParams) => {
  const isHttp = url.startsWith("http");
  let uri = "";
  if (isHttp) {
    uri = url;
  } else {
    let origin = "";
    if (isServer) {
      origin = `${apiProtocol || "http"}//${apiHostName || "localhost"}`;
      if (apiPort) origin += `:${apiPort}`;
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
    uri = `${origin}${apiBasePath || ""}/api${url.startsWith("/") ? url : `/${url}`}`;
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
    console.log(key, JSON.stringify(params[key]));
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

const fetchToElectron = async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
  const res = await electron.fetch<{ data: T; messages: Array<Message>; }>(url, params ?? {}, options);;
  return toData(res);
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
  const json = await res.json();
  return toData(json);
};

const useApi = () => {
  return {
    get: async <T = Struct>(url: string, params?: QueryParams, options?: Options) => {
      const isHttp = url.startsWith("http");
      const requestInit: RequestInit = {
        method: "GET",
        headers: {
          "CSRF-Token": getToken(options),
        },
      };
      if (!isHttp && electron) {
        return await fetchToElectron<T>(url, params, requestInit);
      }
      const uri = assembleUri(url, params);
      const res = await fetch(uri, requestInit);
      return convertResponseToData<T>(res);
    },
    post: async <T = Struct>(url: string, params?: Struct, options?: Options) => {
      const isHttp = url.startsWith("http");
      const requestInit: RequestInit = {
        method: "POST",
        body: options?.useFormData ? toFormData(params) : JSON.stringify(params),
        headers: {
          ...(options?.useFormData ? {} : { "Content-Type": "application/json" }),
          "CSRF-Token": getToken(options),
        },
      };
      if (!isHttp && electron) {
        return await fetchToElectron<T>(url, params, requestInit);
      }
      const uri = assembleUri(url);
      const res = await fetch(uri, requestInit);
      return convertResponseToData<T>(res);
    },
  };
};

export default useApi;