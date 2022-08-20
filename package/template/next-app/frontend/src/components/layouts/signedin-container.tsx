import NavigationContainer, { Navigation } from "@bizhermit/react-addon/dist/elements/navigation-container";
import FlexBox from "@bizhermit/react-addon/dist/elements/flex-box";
import { FC, ReactNode } from "react";
import SignoutButton from "../elements/signout-button";

const SignedinContainer: FC<{ children: ReactNode; }> = ({ children }) => {
  return (
    <NavigationContainer $fto="f">
      <Navigation $mode="visible" $position="left" $signal="default">
        <SignoutButton />
      </Navigation>
      <FlexBox $fto="f">
        {children}
      </FlexBox>
    </NavigationContainer>
  );
};

export default SignedinContainer;