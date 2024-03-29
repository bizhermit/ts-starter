import Button from "@bizhermit/react-addon/dist/elements/button";
import useMessageBox from "@bizhermit/react-addon/dist/message/message-box";
import { FC } from "react";
import { useRouter } from "next/router";

const SignoutButton: FC = () => {
  const router = useRouter();
  const msgBox = useMessageBox();

  const signout = async (unlock: VoidFunc) => {
    if (!await msgBox.confirm(<>サインアウトします。<br/>よろしいですか？</>, "確認")) {
      unlock?.();
      return;
    }
    router.push("/signout");
  };
  
  return <Button $icon="signout" $iconRight $click={signout}>Signout</Button>;
};

export default SignoutButton;