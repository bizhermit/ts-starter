declare module "electron-next" {
  interface Directories {
    production: string
    development: string
  }

  export default function (
    directories: Directories | string,
    port?: number
  ): Promise<void>
}

type Struct<T = any> = { [key: string]: T };
type VoidFunc = () => void;
type Message = {
  title?: string;
  body: string | Array<string>;
  type: MessageType;
};
type MessageType = "info" | "error" | "warning" | "default" | "primary" | "secondary" | "disabled";
type FetchResponse<T extends Struct | string> = {
  data: T;
  messages: Array<Message>;
  ok: boolean;
  status: number;
  statusText: string;
};