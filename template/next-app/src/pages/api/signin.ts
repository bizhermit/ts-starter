import { NextApiRequest, NextApiResponse } from "next";
import ApiContext from "../../modules/backend/api-context";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        ctx.done({ hoge: 1 });
    } catch(e) {
        ctx.error(e);
    }
};
export default handler;