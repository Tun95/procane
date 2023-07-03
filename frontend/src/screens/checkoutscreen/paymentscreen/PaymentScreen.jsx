import React, { useContext } from "react";
import Payment from "../../../components/stepper checkout/Payment";
import { Context } from "../../../context/Context";

function PaymentScreen() {
  const { state } = useContext(Context);
  const { settings } = state;
  return (
    <>
      <div>
        <Payment />
      </div>
    </>
  );
}

export default PaymentScreen;
