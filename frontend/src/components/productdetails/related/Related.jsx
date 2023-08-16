import React from "react";
import RelatedCard from "./RelatedCard";
import "../styles/styles.scss";
function Related({ products, addToCartHandler }) {
  return (
    <>
      <section className="flash background">
        <div className="">
          <div className="heading f_flex">
            <i className="fa fa-bolt"></i>
            <h1>Related Products</h1>
          </div>
          <div className="related_product">
            <RelatedCard
              products={products}
              addToCartHandler={addToCartHandler}
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Related;
