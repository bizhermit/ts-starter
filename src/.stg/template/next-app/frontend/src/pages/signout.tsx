import { NextPage } from "next";
import { useEffect } from "react";
import Link from "next/link";
import Label from "@bizhermit/react-addon/dist/elements/label";
import { useMask } from "@bizhermit/react-addon/dist/popups/mask";
import useApi from "../utils/fetch-api";
import useMessage from "@bizhermit/react-addon/dist/message/message-provider";

const SignoutPage: NextPage = () => {
  const mask = useMask({ show: true, image: "flow" });
  const msg = useMessage();
  const api = useApi();

  const signout = async () => {
    try {
      const res = await api.post("/signout");
      msg.append(res.messages);
      mask.close();
    } catch (e) {
      msg.error(e);
    }
  };

  useEffect(() => {
    signout();
  }, []);

  return (
    <>
      <Label>Singout.</Label>
      <Link href="/">to Index</Link>
    </>
  );
};
export default SignoutPage;