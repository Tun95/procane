import React from "react";
import Terms from "../../../components/about/terms/Terms";
import { Helmet } from "react-helmet-async";

function TermScreen() {
  return (
    <div>
      <Helmet>
        <title>Terms and Conditions</title>
      </Helmet>
      <Terms />
    </div>
  );
}

export default TermScreen;
