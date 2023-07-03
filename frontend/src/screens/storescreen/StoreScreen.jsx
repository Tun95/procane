import React from "react";
import { Helmet } from "react-helmet-async";
import FlashDeals from "../../components/home/flashdeals/FlashDeals";
import Slider from "../../components/home/mainpage/Slider";
import "./styles.scss"
import Store from "../../components/store/Store";

function StoreScreen({ productItems, onAdd }) {
  return (
    <>
      <Helmet>
        <title>Store</title>
      </Helmet>
      <div className="store-pages ">
        <Slider />
        <Store />
        <FlashDeals productItems={productItems} onAdd={onAdd} />
      </div>
    </>
  );
}

export default StoreScreen;
