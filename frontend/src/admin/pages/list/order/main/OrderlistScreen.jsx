import React, { useContext } from "react";
import { Context } from "../../../../../context/Context";
import OrderList from "../sub/OrderList";
import { Helmet } from "react-helmet-async";

function OrderlistScreen() {
  const { state, dispatch } = useContext(Context);
  const { settings } = state;
  return (
    <>
      <Helmet>
        <title>All Orders</title>
      </Helmet>
      <div>
        <OrderList />
      </div>
    </>
  );
}

export default OrderlistScreen;
