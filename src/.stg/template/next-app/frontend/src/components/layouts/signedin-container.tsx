import NavigationContainer, { Navigation } from "@bizhermit/react-addon/dist/elements/navigation-container";
import FlexBox from "@bizhermit/react-addon/dist/elements/flex-box";
import Label from "@bizhermit/react-addon/dist/elements/label";
import { FC, ReactNode } from "react";
import SignoutButton from "../elements/signout-button";
import Header from "@bizhermit/react-addon/dist/elements/header";

const SignedinContainer: FC<{ children: ReactNode; }> = ({ children }) => {
  return (
    <NavigationContainer $fto="f">
      <Navigation $mode="visible" $position="left" $color="default">
        <FlexBox $padding>
          <SignoutButton />
        </FlexBox>
      </Navigation>
      <FlexBox $fto="f">
        <Header $color="default" $padding={1}>
          <Label>User</Label>
        </Header>
        <FlexBox $fto="fy" $padding $scroll>
          {children}
        </FlexBox>
      </FlexBox>
    </NavigationContainer>
  );
};

export default SignedinContainer;