import React, { useContext } from "react";
import { Context } from "../../../../../context/Context";
import ProductList from "../sub/ProductList";

function ProductlistScreen() {
  const { state } = useContext(Context);
  const { settings } = state;
  return (
    <>
      {settings?.map((s, index) => (
        <div key={index}>
          <ProductList webname={s.webname} currencySign={s.currencySign} />
        </div>
      ))}
    </>
  );
}

export default ProductlistScreen;
