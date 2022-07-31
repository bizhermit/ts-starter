import { LayoutProvider } from "@bizhermit/react-sdk/dist/layouts/style";
import type { AppProps, AppContext } from "next/app";
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
    return { initProps };
}

export default AppRoot;