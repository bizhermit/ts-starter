import { LayoutProvider } from "@bizhermit/react-sdk/dist/layouts/style";
import type { AppProps, AppContext } from "next/app";
import electronAccessor from "../core/modules/electron-accessor";
import { StyleColor, StyleDesign } from "@bizhermit/react-sdk/dist/layouts/css-var";
import "../core/styles/base.css";

type AppRootInitProps = {
    layout: {
        color: StyleColor;
        design: keyof typeof StyleDesign;
    };
};

const AppRoot = ({ Component, pageProps, initProps }: AppProps & { initProps: AppRootInitProps }) => {
    return (
        <LayoutProvider color={initProps.layout.color} design={initProps.layout.design}>
            <Component {...pageProps} />
        </LayoutProvider>
    );
};

AppRoot.getInitialProps = async (_ctx: AppContext) => {
    const initProps: AppRootInitProps = {
        layout: {
            color: "system",
            design: "flat",
        },
    };
    const electron = electronAccessor();
    if (electron) {
        initProps.layout.color = electron.getLayoutColor() ?? initProps.layout.color;
        initProps.layout.design = electron.getLayoutDesign() ?? initProps.layout.design;
    }
    return { initProps };
}

export default AppRoot;