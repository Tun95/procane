import React from "react";
import BuyInfo from "../../../components/customer care/how to buy/BuyInfo";
import { Helmet } from "react-helmet-async";

function BuyInfoScreen() {
  return (
    <div>
      <Helmet>
        <title>How to Buy</title>
      </Helmet>
      <BuyInfo />
    </div>
  );
}

export default BuyInfoScreen;
