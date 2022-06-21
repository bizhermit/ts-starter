import { VFC } from "react";
import { Link } from "react-router-dom";

const SummaryPage: VFC = () => {
  return (
    <>
    <h1>Summary</h1>
    <Link to="/">index</Link>
    </>
  );
};

export default SummaryPage;