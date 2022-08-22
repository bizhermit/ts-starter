type Struct<T = any> = { [key: string]: T };
type VoidFunc = () => void;
type Message = {
  title?: string;
  body: string | Array<string>;
  type: MessageType;
};
type MessageType = "info" | "error" | "warning" | "default" | "primary" | "secondary" | "deprecated";
type FetchResponse<T extends Struct | string> = {
  data: T;
  messages: Array<Message>;
  ok: boolean;
  status: number;
  statusText: string;
};