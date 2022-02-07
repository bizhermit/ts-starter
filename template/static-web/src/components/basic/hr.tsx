import { VFC } from "react";
import styled from "styled-components";

const StyledHr = styled.hr`
position: relative;
width: 100%;
padding: 0px;
height: 0px;
border: none;
border-bottom: 1px solid #888;
`;

const HR: VFC = () => {
  return <StyledHr />;
};

export default HR;