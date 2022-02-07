import { NextPage } from "next";
import { VFC } from "react";
import Link from "next/link";

const IndexPage: NextPage = () => {
    return <IndexComponent />;
};

export default IndexPage;

const IndexComponent: VFC = () => {
    return (
        <>
        <h1>Welcom to App extends Next.js</h1>
        <Link href="/sandbox">Sandbox</Link>
        </>
    );
};
