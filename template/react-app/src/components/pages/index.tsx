import { FC } from "react";
import { Link } from "react-router-dom";
import H1 from "../basic/h1";
import { HHR } from "../basic/hr";

const IndexPage: FC = () => {
  return (
    <>
    <H1>__appName__</H1>
    <p className="info">written by react/tsx</p>
    <HHR />
    <Link to="/summary">summary</Link>
    <HogeComponent />
    <FugaComponent />
    </>
  );
};

export default IndexPage;

const HogeComponent: FC = () => {
  return (
    <h1>Hoge</h1>
  );
};

const FugaComponent: FC = () => {
  return (
    <h1>Fuga</h1>
  )
};