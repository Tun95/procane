import React from "react";
import { Helmet } from "react-helmet-async";
import SellerOrderList from "../../sub/order/SellerOrderList";

function SellerOrderListScreen() {
  return (
    <>
      <Helmet>
        <title>Vendor Orders</title>
      </Helmet>
      <div>
        <SellerOrderList />
      </div>
    </>
  );
}

export default SellerOrderListScreen;
