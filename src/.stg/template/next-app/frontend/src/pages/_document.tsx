import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

const DocumentRoot = () => {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

DocumentRoot.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx);
  return initialProps;
};

export default DocumentRoot;