import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    try {
        console.log(ctx.getParams());
        ctx.done({ text: "hello" });
    } catch(err) {
        ctx.error(err);
    }
};
export default handler;