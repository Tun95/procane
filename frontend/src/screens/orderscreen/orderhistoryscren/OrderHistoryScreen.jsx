import React from "react";
import { Helmet } from "react-helmet-async";
import OrderHistory from "../../../components/orders/orderhistory/OrderHistory";

function OrderHistoryScreen() {
  return (
    <>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <div className="container">
        <OrderHistory />
      </div>
    </>
  );
}

export default OrderHistoryScreen;
