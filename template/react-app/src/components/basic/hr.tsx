import { FC } from "react";
import styled from "styled-components";

const StyledHHr = styled.hr`
position: relative;
padding: 0px;
width: 100%;
height: 0px;
border: none;
border-bottom: 1px solid #888;
`;

export const HHR: FC = () => {
  return <StyledHHr />;
};

const StyledVHr = styled.hr`
position: relative;
padding: 0px;
width: 0px;
height: 100%;
border: none;
border-right: 1px solid #888;
`;

export const VHR: FC = () => {
  return <StyledVHr />;
};