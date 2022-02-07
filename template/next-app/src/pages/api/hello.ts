import ApiContext from "@bizhermit/next-absorber/dist/api-context";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = new ApiContext(req, res);
    ctx.done();
};
export default handler;