import { NextApiRequest, NextApiResponse } from "next";
import ApiContext from "../../utils/api-context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = new ApiContext(req, res);
  try {
    let count = Number(ctx.getSession("count") ?? -1);
    count++;
    ctx.setSession("count", count);
    ctx.done({ count }, "hello!");
  } catch (e) {
    ctx.error(e);
  }
};
export default handler;