import StringUtils from "@bizhermit/basic-utils/dist/string-utils";

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

    public addMessage(props: Message, absolute?: boolean) {
        if (props == null) return this;
        if (StringUtils.isEmpty(props.message)) return this;
        if (absolute !== true) {
            if (this.messages.find(item => {
                if (item.type !== props.type) return false;
                if (!equal(item.message, props.message)) return false;
                if (!equal(item.title, props.title)) return false;
                return true;
            })) {
                return this;
            }
        }
        this.messages.push({
            type: props.type,
            title: props.title ?? "",
            message: props.message,
        });
        return this;
    }

    public addInformation(message: string | ArgMessageProps, absolute?: boolean) {
        if (message == null) return this;
        return this.addMessage({ type: "info", ...(typeof message === "string" ? { message } : message) }, absolute);
    }

    public addWarning(message: string | ArgMessageProps, absolute?: boolean) {
        if (message == null) return this;
        return this.addMessage({ type: "warn", ...(typeof message === "string" ? { message } : message) }, absolute);
    }

    public addError(message: string | ArgMessageProps, absolute?: boolean) {
        if (message == null) return this;
        return this.addMessage({ type: "err", ...(typeof message === "string" ? { message } : message) }, absolute);
    }

    public hasMessage(type?: MessageType) {
        if (StringUtils.isEmpty(type)) return this.messages.length > 0;
        return this.messages.some(item => item.type === type);
    }

    public hasInformation() {
        return this.hasMessage("info");
    }

    public hasWarning() {
        return this.hasMessage("warn");
    }

    public hasError() {
        return this.hasMessage("err");
    }

    public getMessageCount(type?: MessageType) {
        if (StringUtils.isEmpty(type)) return this.messages.length;
        return this.messages.filter(item => item.type === type).length;
    }

    public getInformationCount() {
        return this.getMessageCount("info");
    }

    public getWarningCount() {
        return this.getMessageCount("warn");
    }

    public getErrorCount() {
        return this.getMessageCount("err");
    }

};

export default MessageContext;