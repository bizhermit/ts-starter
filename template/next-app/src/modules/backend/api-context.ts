class ApiContext {

    constructor(protected req: any, protected res: any) {
        if (this.req.session == null) {
            this.req.session = (global as any)._session ?? {};
        }
    }

    protected setData(data: {[key: string]: any} = {}) {
        this.res.json({ data });
        return this;
    }

    protected setStatus(code: number) {
        this.res.status(code);
    }

    public done(data: {[key: string]: any} = {}, message?: string, title?: string) {
        this.doneAs(200, data, message, title);
    }

    public doneAs(code?: number, data: {[key: string]: any} = {}, message?: string, title?: string) {
        this.setData(data).setStatus(code ?? 200);
    }

    public error(err?: any) {
        this.setData({}).setStatus(500);
    }

};
export default ApiContext;