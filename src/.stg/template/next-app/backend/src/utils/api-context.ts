import MessageContext from "./message-context";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";

class ApiContext extends MessageContext {

  constructor(protected req: any, protected res: any) {
    super();
    if (this.req.session == null) {
      this.req.session = (global as any)._session ?? {};
    }
  }

  public getRequest<T = Struct>(): T {
    return this.req as T;
  }

  public getResponse<T = Struct>(): T {
    return this.res as T;
  }

  public getMethod(): string {
    return this.req.method || "";
  }

  public getParams<T = Struct>(): T {
    return this.req.body as T;
  }

  public getQuery(key: string): string | string[] {
    return this.req.query?.[key];
  }

  public getCookie(key: string): string {
    return this.req.cookies?.[key];
  }

  public getSessionID(): string {
    return this.req.sessionID ?? "";
  }

  public getSession<T>(key: string) {
    if (StringUtils.isEmpty(key)) return undefined;
    return this.req.session[key] as T;
  }

  public setSession(key: string, value: any) {
    if (StringUtils.isEmpty(key)) return this;
    this.req.session[key] = value;
    return this;
  }

  public clearSession(key?: string) {
    if (StringUtils.isEmpty(key)) {
      Object.keys(this.req.session).forEach((k) => {
        this.clearSessionByKey(k);
      });
    } else {
      this.clearSessionByKey(key);
    }
    return this;
  }

  protected clearSessionByKey(key: string) {
    if (key === "regenerate") return;
    delete this.req.session[key];
  }

  public regenerateSession(keepParams?: boolean) {
    return new Promise<this>((resolve, reject) => {
      try {
        const buf: Struct = {};
        if (keepParams === true) {
          Object.keys(this.req.session).forEach((key) => {
            buf[key] = this.req.session[key];
          });
        }
        const revertValues = () => {
          Object.keys(buf).forEach((key) => {
            this.req.session[key] = buf[key];
          });
        };
        if (this.req.session.regenerate && typeof this.req.session.regenerate === "function") {
          this.req.session.regenerate(() => {
            revertValues();
            resolve(this);
          });
          return;
        }
        this.clearSession();
        revertValues();
        resolve(this);
      } catch (err) {
        reject(err);
      }
    });
  }

  protected setData(data: Struct) {
    this.res.json({ data: data ?? {}, messages: this.getMessages() });
    return this;
  }

  protected setStatus(code: number) {
    this.res.status(code);
  }

  public done(data: Struct = {}, message?: string, title?: string) {
    this.doneAs(200, data, message, title);
  }

  public doneAs(code?: number, data: Struct = {}, message?: string, title?: string) {
    if (StringUtils.isNotEmpty(message)) this.addInformation({ title, body: message, type: "info"});
    this.setData(data).setStatus(code ?? 200);
  }

  public error(err?: any) {
    if (err) this.addError(String(err));
    this.setData({}).setStatus(500);
  }

};
export default ApiContext;