import { NextApiRequest, NextApiResponse } from "next";
import ApiContext from "../../utils/api-context";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        const { inputs } = ctx.getParams();
        console.log(inputs);
        ctx.done({ hoge: 1 });
    } catch (e) {
        ctx.error(e);
    }
};
export default handler;