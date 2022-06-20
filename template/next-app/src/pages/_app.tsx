import { LayoutProvider } from "@bizhermit/react-sdk/dist/layouts/style";
import type { AppProps } from "next/app";
import "../styles/base.css";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <LayoutProvider color="system" design="flat">
        <Component {...pageProps} />
    </LayoutProvider>
  );
};
export default App;