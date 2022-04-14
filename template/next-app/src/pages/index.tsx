import { NextPage } from "next";
import { FC } from "react";
import Link from "next/link";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import fetchApi from "@bizhermit/next-absorber/dist/fetch";

const IndexPage: NextPage = () => {
    return <IndexComponent />;
};

export default IndexPage;

const IndexComponent: FC = () => {
    const msg = useMessage();

    const click = async (unlock: VoidFunc) => {
        try {
            const ret = await fetchApi("hello", { test: 1 });
            msg.append(ret.messages);
            if (!ret.hasError()) {
                console.log(ret.data);
            }
        } catch (err) {
            msg.error(err);
        }
        unlock();
    };

    return (
        <>
        <h1>Welcom to App extends Next.js</h1>
        <Link href="/sandbox">Sandbox</Link>
        <Button click={click}>fetch api: hello</Button>
        </>
    );
};
