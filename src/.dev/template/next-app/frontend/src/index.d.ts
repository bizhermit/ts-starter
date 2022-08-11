type Struct<T = any> = { [key: string]: T };
type VoidFunc = () => void;
type Message = {
  title?: string;
  body: string | Array<string>;
  type: MessageType;
};
type MessageType = "info" | "error" | "warning" | "default" | "primary" | "secondary" | "deprecated";
type FetchApiResponse<T = Struct> = {
  data: T;
  messages: Array<Message>;
  hasInformation: () => boolean;
  hasWarning: () => boolean;
  hasError: () => boolean;
};