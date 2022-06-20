type MessageType = "info" | "warn" | "err";
type Message = {
    type: MessageType;
    title?: string;
    message: string;
};
type ArgMessageProps = {
    message: string;
    title?: string;
};
type FetchApiResponse<T = {[key: string]: any}> = {
    data: T;
    messages: Array<Message>;
    hasInformation: () => boolean;
    hasWarning: () => boolean;
    hasError: () => boolean;
};