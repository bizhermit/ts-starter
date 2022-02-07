import GroupBox from "@bizhermit/react-sdk/dist/containers/groupbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import useMessageBox from "@bizhermit/react-sdk/dist/hooks/message-box";
import { useLayout } from "@bizhermit/react-sdk/dist/layouts/style";
import { NextPage } from "next";
import Link from "next/link";
import { VFC } from "react";

const SandboxPage: NextPage = () => {
    return <SandboxComponent />;
};

export default SandboxPage;

const SandboxComponent: VFC = () => {
    const layout = useLayout();
    const msgbox = useMessageBox();
    return (
        <>
        <h1>Sandbox</h1>
        <Link href="/">index</Link>
        <Row>
            <GroupBox caption="color">
                <Button click={() => {
                    layout.setColor(null);
                }}>unset</Button>
                <Button click={() => {
                    layout.setColor("light");
                }}>Light</Button>
                <Button click={() => {
                    layout.setColor("dark");
                }}>Dark</Button>
            </GroupBox>
            <GroupBox caption="design">
                <Button click={() => {
                    layout.setDesign(null);
                }}>unset</Button>
                <Button click={async (unlock) => {
                    // style.setDesign("flat");
                    await msgbox.alert("Unimplemented...");
                    unlock();
                }}>Flat</Button>
                <Button click={() => {
                    layout.setDesign("material");
                }}>Material</Button>
                <Button click={() => {
                    layout.setDesign("neumorphism");
                }}>Neumorphism</Button>
            </GroupBox>
        </Row>
        </>
    );
};