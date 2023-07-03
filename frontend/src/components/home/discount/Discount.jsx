import React from "react";
import DCard from "./DCard";
import { Link } from "react-router-dom";

function Discount() {
  return (
    <>
      <section className=" background newarrivals">
        <div className="container">
          <div className="heading d_flex">
            <div className="heading-left row f_flex">
              <img
                src="https://img.icons8.com/windows/32/fa314a/gift.png"
                alt=""
              />

              <h2>Big Discount</h2>
            </div>
            <div className="heading-right row">
              <Link to="/store?order=discount&discount=50">View all</Link>
              <i className="fa fa-caret-right"></i>
            </div>
          </div>
          <DCard />
        </div>
      </section>
    </>
  );
}

export default Discount;
