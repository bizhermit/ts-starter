type Message = {
    type: "info" | "warn" | "err";
    title?: string;
    message: string;
};
type FetchApiResponse<T = {[key: string]: any}> = {
    data: T;
    messages: Array<Message>;
    hasInformation: () => boolean;
    hasWarning: () => boolean;
    hasError: () => boolean;
};