import { NextApiRequest, NextApiResponse } from "next";
import ApiContext from "../../utils/api-context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = new ApiContext(req, res);
  try {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    ctx.regenerateSession(false);
    ctx.done({});
  } catch (e) {
    ctx.error(e);
  }
};
export default handler;