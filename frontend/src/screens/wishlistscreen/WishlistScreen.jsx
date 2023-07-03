import React from "react";
import Wish from "../../components/wish list/Wish";
import { Helmet } from "react-helmet-async";

function WishlistScreen() {
  
  return (
    <div className="container wish_container">
      <Helmet>
        <title>Wish List</title>
      </Helmet>
      <div className="box_shadow mtb">
        <div className="productTitleContainer ">
          <h2 className="featured uppercase">Wish List </h2>
        </div>
        <div className="product-content ">
          <Wish />
        </div>
      </div>
    </div>
  );
}

export default WishlistScreen;
