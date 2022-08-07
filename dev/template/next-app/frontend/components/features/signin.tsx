import Button from "@bizhermit/react-addon/dist/elements/button";
import Caption from "@bizhermit/react-addon/dist/elements/caption";
import FlexBox from "@bizhermit/react-addon/dist/elements/flex-box";
import TextBox from "@bizhermit/react-addon/dist/elements/inputs/text-box";
import useMessage from "@bizhermit/react-addon/dist/message/message-provider";
import { FitToOuter } from "@bizhermit/react-addon/dist/styles/css-var";
import { FC, useState } from "react";
import fetchApi from "../../utils/fetch-api";

const SigninComponent: FC<{ $fto?: FitToOuter }> = ({ $fto }) => {
  const msg = useMessage();
  const [inputs, _setInputs] = useState<Struct>({});

  const signin = async (unlock?: VoidFunc) => {
    try {
      const res = await fetchApi("/signin", { inputs });
      msg.append(res.messages);
      if (!res.hasError()) {
        console.log(res.data);
      }
    } catch (e) {
      msg.error(e);
    }
    unlock?.();
  };

  return (
    <FlexBox $fto={$fto} $center $middle>
      <FlexBox $center $middle>
        <Caption $label="User" $width={120}>
          <TextBox $bind={inputs} $name="user" style={{ width: 200 }} />
        </Caption>
        <Caption $label="Password" $width={120}>
          <TextBox $bind={inputs} $name="password" $type="password" style={{ width: 200 }} />
        </Caption>
        <Button $icon="signin" $click={signin}>Signin</Button>
      </FlexBox>
    </FlexBox>
  );
};
export default SigninComponent;