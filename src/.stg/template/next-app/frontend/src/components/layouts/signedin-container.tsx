import NavigationContainer, { Navigation } from "@bizhermit/react-addon/dist/elements/navigation-container";
import FlexBox from "@bizhermit/react-addon/dist/elements/flex-box";
import Row from "@bizhermit/react-addon/dist/elements/row";
import Label from "@bizhermit/react-addon/dist/elements/label";
import { FC, ReactNode } from "react";
import SignoutButton from "../elements/signout-button";

const SignedinContainer: FC<{ children: ReactNode; }> = ({ children }) => {
  return (
    <NavigationContainer $fto="f">
      <Navigation $mode="visible" $position="left" $color="default">
        <SignoutButton />
      </Navigation>
      <FlexBox $fto="f">
        <Row $fill $color="default" $colorType="nav" $padding={1}>
          <Label>User</Label>
        </Row>
        <FlexBox $fto="fy" $padding $scroll>
          {children}
        </FlexBox>
      </FlexBox>
    </NavigationContainer>
  );
};

export default SignedinContainer;