import React from "react";
import ShopCard from "./ShopCard";
import "./styles.scss";
import { Link } from "react-router-dom";

function Shop() {
  return (
    <>
      <section className="shop background" id="shop">
        <div className="container d_flex shop-grid">
          <div className="">
            <div className="heading d_flex">
              <div className="heading-left row  f_flex">
                <h2>List of Products</h2>
              </div>
              <div className="heading-right row ">
                <Link to="/store">View all</Link>
                <i className="fa-solid fa-caret-right"></i>
              </div>
            </div>
            <div className="product-content">
              <ShopCard />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Shop;
