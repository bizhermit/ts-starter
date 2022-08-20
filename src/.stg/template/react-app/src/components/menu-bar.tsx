import MenuContainer from "@bizhermit/react-sdk/dist/containers/menu-container";
import { MenuItemProps } from "@bizhermit/react-sdk/dist/controls/menu-list";
import { useLayout } from "@bizhermit/react-sdk/dist/layouts/style";
import { createContext, FC, ReactNode, useContext, useMemo, useState } from "react";
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

const MenuBar: FC<{ children: ReactNode }> = ({ children }) => {
  const layout = useLayout();
  const [title, setTitle] = useState("");

  const menuItems = useMemo<Array<MenuItemProps>>(() => [{
    label: "style",
    iconImage: "gear",
    childItems: [{
      label: "Color",
      caption: true,
    }, {
      label: "System",
      clicked: () => {
        layout.setColor("system");
        return false;
      },
    }, {
      label: "Light",
      clicked: () => {
        layout.setColor("light");
        return false;
      },
    }, {
      label: "Dark",
      clicked: () => {
        layout.setColor("dark");
        return false;
      },
    }, {
      label: "Design",
      caption: true,
    }, {
      label: "Flat",
      clicked: () => {
        layout.setDesign("flat");
        return false;
      },
    }, {
      label: "Material",
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

const HeaderComponent: FC = () => {
  const titleCtx = useContext(TitleContext);
  return (
    <>
    <MenuBarTitle><Anchor href="/">__appName__</Anchor></MenuBarTitle>
    <MenuBarSubTitle>{titleCtx.title}</MenuBarSubTitle>
    </>
  );
}