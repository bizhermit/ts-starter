import { AppContext, AppProps } from "next/app";
import LayoutProvider from "@bizhermit/react-addon/dist/styles/layout-provider";
import { MaskProvider } from "@bizhermit/react-addon/dist/popups/mask";
import { MessageProvider } from "@bizhermit/react-addon/dist/message/message-provider";
import { LayoutColor, LayoutDesign } from "@bizhermit/react-addon/dist/styles/css-var";
import { hasCookie } from "cookies-next";
import fetchApi from "../utils/fetch-api";
import electronAccessor from "../utils/electron-accessor";
import '../styles/globals.css'

type AppRootInitProps = {
  layout: {
    color: LayoutColor;
    design: LayoutDesign;
  };
};

const AppRoot = ({ Component, pageProps, initProps }: AppProps & { initProps: AppRootInitProps }) => {
  return (
    <LayoutProvider color={initProps.layout.color} design={initProps.layout.design}>
      <MaskProvider >
        <MessageProvider>
          <Component {...pageProps} />
        </MessageProvider>
      </MaskProvider>
    </LayoutProvider>
  );
};

AppRoot.getInitialProps = async ({ ctx }: AppContext) => {
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
  } else {
    try {
      if (!hasCookie("XSRF-TOKEN", ctx)) {
        const csrfPath = process.env.CSRF_PATH || "/csrf";
        await fetchApi.get(csrfPath, null, {
          req: ctx.req,
          res: ctx.res,
          api: false,
        });
      }
    } catch {}
  }
  return { initProps };
}

export default AppRoot;