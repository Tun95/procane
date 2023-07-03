import React from "react";
import Privacy from "../../../components/about/privacy/Privacy";
import { Helmet } from "react-helmet-async";

function PrivacyScreen() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>
      <Privacy />
    </div>
  );
}

export default PrivacyScreen;
