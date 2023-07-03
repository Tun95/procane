import React from "react";
import Bulk from "../../../components/customer care/bulk purchase/Bulk";
import { Helmet } from "react-helmet-async";

function BulkScreen() {
  return (
    <div>
      <Helmet>
        <title>Corporate & Bulk Purchasing</title>
      </Helmet>
      <Bulk />
    </div>
  );
}

export default BulkScreen;
