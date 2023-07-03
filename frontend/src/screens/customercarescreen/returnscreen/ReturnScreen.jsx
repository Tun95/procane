import React from "react";
import Returns from "../../../components/customer care/returns/Returns";
import { Helmet } from "react-helmet-async";

function ReturnScreen() {
  return (
    <div>
      <Helmet>
        <title>Returns & Refunds</title>
      </Helmet>
      <Returns />
    </div>
  );
}

export default ReturnScreen;
