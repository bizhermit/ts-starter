import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import TextBox from "@bizhermit/react-sdk/dist/controls/textbox";
import { FitToOuter } from "@bizhermit/react-sdk/dist/utils/classname-utils";
import { FC, useState } from "react";
import fetchApi from "../modules/frontend/fetch-api";

const SigninComponent: FC<{ fto?: FitToOuter }> = ({ fto }) => {
    const [inputs, setInputs] = useState<Struct>({});

    const signin = async (unlock?: VoidFunc) => {
        try {
            const res = await fetchApi("/signin", { inputs });
            console.log(res);
        } catch(e) {
            setInputs({});
        }
        unlock?.();
    };

    return (
        <FlexBox fitToOuter={fto} column center middle>
            <FlexBox column center middle>
                <Caption label="User" labelWidth={120}>
                    <TextBox bind={inputs} name="user" style={{ width: 200 }} />
                </Caption>
                <Caption label="Password" labelWidth={120}>
                    <TextBox bind={inputs} name="password" type="password" style={{ width: 200 }} />
                </Caption>
                <Button image="signin" click={signin}>Signin</Button>
            </FlexBox>
        </FlexBox>
    );
};
export default SigninComponent;