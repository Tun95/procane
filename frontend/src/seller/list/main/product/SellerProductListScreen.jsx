import React, { useContext } from "react";
import SellerProductList from "../../sub/product/SellerProductList";
import { Context } from "../../../../context/Context";

function SellerProductListScreen() {
  const { state } = useContext(Context);
  const { settings } = state;
  return (
    <>
      <div>
        <SellerProductList />
      </div>
    </>
  );
}

export default SellerProductListScreen;
