import isServer from "./is-server";

const apiProtocol = process.env.API_PROTOCOL;
const apiHostName = process.env.API_HOST_NAME;
const apiPort = process.env.API_PORT;
const apiBasePath = process.env.API_BASE_PATH;

type GetParamType = string | number | boolean | null | undefined;
type QueryParams = { [key: string]: GetParamType | Array<GetParamType> };

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
  const json = await res.json();
  return toData(json);
};

const useApi = () => {
  return {
    get: async <T = Struct>(url: string, params?: QueryParams, _options?: RequestInit) => {
      const uri = assembleUri(url, params);
      const res = await fetch(uri, {
        method: "GET",
      });
      return convertResponseToData<T>(res);
    },
    post: async <T = Struct>(url: string, params?: Struct, _options?: RequestInit) => {
      const uri = assembleUri(url);
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