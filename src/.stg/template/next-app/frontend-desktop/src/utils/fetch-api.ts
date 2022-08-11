import isServer from "./is-server";

const apiProtocol = process.env.API_PROTOCOL;
const apiHostName = process.env.API_HOST_NAME;
const apiPort = process.env.API_PORT;
const apiBasePath = process.env.API_BASE_PATH;
const electron = (global as any).electron as ElectronAccessor;

const fetchToElectron = async <T>(url: string, params?: Struct, options?: RequestInit) => {
  return electron.fetch(url, params ?? {}, options);
};

const getOrigin = () => {
  if (isServer) {
    return {
      protocol: apiProtocol || "http:",
      hostname: apiHostName || "localhost",
      port: apiPort || "",
    };
  }
  return {
    protocol: apiProtocol || window.location.protocol,
    hostname: apiHostName || window.location.hostname,
    port: apiPort || "",
  };
};

type GetParamType = string | number | boolean | null | undefined;
type QueryParams = { [key: string]: GetParamType | Array<GetParamType> };

const assembleUri = (url: string, queryParams?: QueryParams) => {
  const isHttp = url.startsWith("http");
  let uri = "";
  const { protocol, hostname, port } = getOrigin();
  if (isHttp) {
    uri = url;
  } else {
    uri = `${protocol}//${hostname}${port ? `:${port}` : ""}${apiBasePath || ""}/api${url.startsWith("/") ? url : `/${url}`}`;
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
  return {
    uri: encodeURI(uri),
    protocol,
    hostname,
    port,
  };
};

type FetchResponseData<T> = {
  data: T;
  messages: Array<Message>
  hasMessage: () => boolean;
  hasError: () => boolean;
};
const convertResponseToData = async <T = Struct>(res: Response): Promise<FetchResponseData<T>> => {
  console.log(res);
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
  const messages: Array<Message> = Array.isArray(json.messages) ? json.messages : [];
  return {
    data: json.data as T,
    messages,
    hasError: () => messages.some(msg => msg.type === "error"),
    hasMessage: () => messages.length > 0
  };
};

const useApi = () => {
  return {
    get: async <T = Struct>(url: string, params?: QueryParams, options?: RequestInit) => {
      const isHttp = url.startsWith("http");
      if (!isHttp && electron) {
        return await fetchToElectron<T>(url, params, options);
      }
      const { uri } = assembleUri(url, params);
      const res = await fetch(uri, {
        method: "GET",
      });
      return convertResponseToData<T>(res);
    },
    post: async <T = Struct>(url: string, params?: Struct, options?: RequestInit) => {
      const isHttp = url.startsWith("http");
      if (!isHttp && electron) {
        return await fetchToElectron<T>(url, params, options);
      }
      const { uri } = assembleUri(url);
      console.log(uri);
      const res = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params ?? {}),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return convertResponseToData<T>(res);
    },
  };
};

export default useApi;