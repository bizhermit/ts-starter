import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import type { Message, MessageType } from "@bizhermit/react-addon/dist/message/message-provider";

const equal = (val1?: string, val2?: string) => {
  return (val1 ?? "") === (val2 ?? "");
};

class MessageContext {

  protected messages: Array<Message>;

  constructor() {
    this.messages = [];
  }

  public getMessages() {
    return this.messages;
  }

  public clearMessages() {
    this.messages = [];
    return this;
  }

  public addMessage(message: Message, absolute?: boolean) {
    if (message == null) return this;
    if (message.body == null || message.body === "" || message.body.length === 0 || message.body[0] === "") return this;
    if (absolute !== true) {
      if (this.messages.find(msg => {
        if (msg.type !== message.type) return false;
        if (!equal(msg.title, message.title)) return false;
        if (typeof msg.body === "string") {
          msg.body = [ msg.body ];
        }
        if (typeof message.body === "string") {
          msg.body?.push(message.body);
          return true;
        }
        if (Array.isArray(message.body)) {
          msg.body?.push(...message.body);
          return true;
        }
        return false;
      })) {
        return this;
      }
    }
    this.messages.push({
      type: message.type,
      title: message.title ?? "",
      body: message.body,
    });
    return this;
  }

  public addInformation(message: string | Message, absolute?: boolean) {
    if (message == null) return this;
    return this.addMessage({ type: "info", ...(typeof message === "string" ? { body: [ message ] } : message) }, absolute);
  }

  public addWarning(message: string | Message, absolute?: boolean) {
    if (message == null) return this;
    return this.addMessage({ type: "warning", ...(typeof message === "string" ? { body: [ message ] } : message) }, absolute);
  }

  public addError(message: string | Message, absolute?: boolean) {
    if (message == null) return this;
    return this.addMessage({ type: "error", ...(typeof message === "string" ? { body: [ message ] } : message) }, absolute);
  }

  public hasMessage(type?: MessageType) {
    if (StringUtils.isEmpty(type)) return this.messages.length > 0;
    return this.messages.some(item => item.type === type);
  }

  public hasInformation() {
    return this.hasMessage("info");
  }

  public hasWarning() {
    return this.hasMessage("warning");
  }

  public hasError() {
    return this.hasMessage("error");
  }

  public getMessageCount(type?: MessageType) {
    if (StringUtils.isEmpty(type)) return this.messages.length;
    return this.messages.filter(item => item.type === type).length;
  }

  public getInformationCount() {
    return this.getMessageCount("info");
  }

  public getWarningCount() {
    return this.getMessageCount("warning");
  }

  public getErrorCount() {
    return this.getMessageCount("error");
  }

};

export default MessageContext;