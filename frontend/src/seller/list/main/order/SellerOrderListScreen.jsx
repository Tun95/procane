import React from "react";
import SellerOrderList from "../../sub/orders/SellerOderList";
import { Helmet } from "react-helmet-async";

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
