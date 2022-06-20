import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";
import nextConfig from "../../next.config";

class AppDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);
        return initialProps;
    }

    render() {
        return (
            <Html>
                <Head />
                <body>
                    <input type="hidden" id="basePath" value={nextConfig.basePath ?? ""} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default AppDocument;