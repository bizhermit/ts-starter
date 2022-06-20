import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";

class AppDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx);
        return initialProps;
    }

    render(): JSX.Element {
        console.log(global);
        return (
            <Html>
                <Head />
                <body>
                    <input type="hidden" id="basePath" value={(global as any)._basePath} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default AppDocument;