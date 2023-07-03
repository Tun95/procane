import React, { useContext } from "react";
import Seller from "../sub/Seller";
import { Helmet } from "react-helmet-async";
import { Context } from "../../../context/Context";

function SellerScreen() {
  const { state } = useContext(Context);
  const { settings } = state;
  return (
    <div className="mtb">
      {" "}
      <Helmet>
        <title>Vendors's products</title>
      </Helmet>
      <div>
        <Seller />
      </div>
    </div>
  );
}

export default SellerScreen;
