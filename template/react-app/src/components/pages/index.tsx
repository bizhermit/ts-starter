import { VFC } from "react";
import { Link } from "react-router-dom";
import H1 from "../basic/h1";
import HR from "../basic/hr";

const IndexPage: VFC = () => {
  return (
    <>
    <H1>Homepage Starter</H1>
    <p className="info">written by react/tsx</p>
    <HR />
    <Link to="/summary">summary</Link>
    <HogeComponent />
    <FugaComponent />
    </>
  );
};

export default IndexPage;

const HogeComponent: VFC = () => {
  return (
    <h1>Hoge</h1>
  );
};

const FugaComponent: VFC = () => {
  return (
    <h1>Fuga</h1>
  )
};