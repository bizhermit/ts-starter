import { FC } from "react";
import styled from "styled-components";

const StyledH1 = styled.h1`
position: relative;
border-bottom: 1px solid #888;
padding: 0px 10px;

&:hover {
  &::before {
    position: absolute;
    content: "";
    top: 0px;
    left: 0px;
    height: 100%;
    width: 5px;
    background: #888;
  }
}
`;

const H1: FC = ({ children }) => {
  return <StyledH1>{children}</StyledH1>;
};

export default H1;