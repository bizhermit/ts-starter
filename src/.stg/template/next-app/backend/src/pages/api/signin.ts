import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { NextApiRequest, NextApiResponse } from "next";
import ApiContext from "../../utils/api-context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = new ApiContext(req, res);
  try {
    const { inputs } = ctx.getParams<{ inputs: { user?: string; password?: string; } }>();
    console.log(inputs);
    const id = inputs.user?.replace(/\s/g, "");
    if (StringUtils.isEmpty(id)) {
      ctx.error("user is empty");
      return;
    }
    ctx.setSession("userId", id);
    ctx.done({ id });
  } catch (e) {
    ctx.error(e);
  }
};
export default handler;