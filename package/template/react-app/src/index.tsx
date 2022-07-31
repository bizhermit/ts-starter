import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./utils/reportWebVitals";
import "./base.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MenuBar from "./components/menu-bar";
import IndexPage from "./components/pages";
import SummaryPage from "./components/pages/summary";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import { LayoutProvider } from "@bizhermit/react-sdk/dist/layouts/style";

const Pages = () => 
<LayoutProvider color="system" design="neumorphism">
<BrowserRouter basename="/">
<MenuBar>
<FlexBox fitToOuter="fill" style={{ padding: 5 }} scroll>
<Routes>
  {/* add page component */}
  <Route path="/" element={<IndexPage />} />
  <Route path="/summary" element={<SummaryPage />} />
</Routes>
</FlexBox>
</MenuBar>
</BrowserRouter>
</LayoutProvider>
;

ReactDOM.render(<React.StrictMode><Pages /></React.StrictMode>, document.getElementById("root"));

reportWebVitals();