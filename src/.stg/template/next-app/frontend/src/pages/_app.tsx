import { AppContext, AppProps } from "next/app";
import LayoutProvider from "@bizhermit/react-addon/dist/styles/layout-provider";
import { MaskProvider } from "@bizhermit/react-addon/dist/popups/mask";
import { MessageProvider } from "@bizhermit/react-addon/dist/message/message-provider";
import { LayoutColor, LayoutDesign } from "@bizhermit/react-addon/dist/styles/css-var";
import { hasCookie } from "cookies-next";
import fetchApi from "../utils/fetch-api";
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
  )
};

AppRoot.getInitialProps = async ({ ctx }: AppContext) => {
  try {
    if (!hasCookie("XSRF-TOKEN", ctx)) {
      await fetchApi.get("/frsc", null, {
        req: ctx.req,
        res: ctx.res,
        api: false,
      });
    }
  } catch {}
  const initProps: AppRootInitProps = {
    layout: {
      color: "system",
      design: "flat",
    },
  };
  return { initProps };
}

export default AppRoot;