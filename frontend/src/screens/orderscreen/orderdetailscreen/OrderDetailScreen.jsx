import React, { useContext } from 'react'
import { Context } from '../../../context/Context';
import OrderDetails from '../../../components/orders/orderdetails/OrderDetails';

function OrderDetailScreen() {
	const { state } = useContext(Context);
  const { settings } = state;
  return (
    <>
      {settings?.map((s, index) => (
        <div key={index} className="container">
          <OrderDetails webname={s.webname} currencySign={s.currencySign} />
        </div>
      ))}
    </>
  );
}

export default OrderDetailScreen