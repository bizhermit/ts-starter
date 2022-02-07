import MenuContainer from "@bizhermit/react-sdk/dist/containers/menu-container";
import { MenuItemProps } from "@bizhermit/react-sdk/dist/controls/menu-list";
import { useLayout } from "@bizhermit/react-sdk/dist/layouts/style";
import { createContext, FC, useContext, useMemo, useState, VFC } from "react";
import styled from "styled-components";
import Anchor from "./basic/anchor";

const MenuBarTitle = styled.span`
display: inline-block;
font-size: 28px;
padding: 2px 20px 0px 20px;
& * {
  color: inherit !important;
  text-decoration: none !important;
}
`;
const MenuBarSubTitle = styled.span`
display: inline-block;
font-size: 20px;
padding: 2px 10px 0px 10px;
`;

export const TitleContext = createContext<{ title: string; setTitle: (title?: string) => void }>({ title: "", setTitle: () => {} });

const MenuBar: FC = ({ children }) => {
  const layout = useLayout();
  const [title, setTitle] = useState("");

  const menuItems = useMemo<Array<MenuItemProps>>(() => [{
    label: "style",
    iconImage: "gear",
    childItems: [{
      label: "light color",
      clicked: () => {
        layout.setColor("light");
        return false;
      },
    }, {
      label: "dark color",
      clicked: () => {
        layout.setColor("dark");
        return false;
      },
    }, {
      label: "material design",
      clicked: () => {
        layout.setDesign("material");
        return false;
      },
    }, {
      label: "neumorphism design",
      clicked: () => {
        layout.setDesign("neumorphism");
        return false;
      }
    }]
  }], []);

  return (
    <TitleContext.Provider value={{ title, setTitle }} >
      <MenuContainer header={{ jsx: <HeaderComponent /> }} menu={{ items: menuItems, position: "right", mode: "closeToHeader", width: 240, resize: false }} style={{ height: "100%", width: "100%" }}>
        {children}
      </MenuContainer>
    </TitleContext.Provider>
  );
};

export default MenuBar;

const HeaderComponent: VFC = () => {
  const titleCtx = useContext(TitleContext);
  return (
    <>
    <MenuBarTitle><Anchor href="/">BizHermit</Anchor></MenuBarTitle>
    <MenuBarSubTitle>{titleCtx.title}</MenuBarSubTitle>
    </>
  );
}