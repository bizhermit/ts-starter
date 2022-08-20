import { NextPage } from "next";
import { useEffect } from "react";
import Link from "next/link";
import Label from "@bizhermit/react-addon/dist/elements/label";
import { useMask } from "@bizhermit/react-addon/dist/popups/mask";
import useMessage from "@bizhermit/react-addon/dist/message/message-provider";
import fetchApi from "../utils/fetch-api";

const SignoutPage: NextPage = () => {
  const mask = useMask({ show: true, image: "flow" });
  const msg = useMessage();

  const signout = async () => {
    try {
      const res = await fetchApi.post("/signout");
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