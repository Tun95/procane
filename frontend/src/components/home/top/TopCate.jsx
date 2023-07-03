import React from "react";
import { Link } from "react-router-dom";
import TopCard from "./TopCard";

function TopCate() {
  return (
    <>
      <section className=" background newarrivals">
        <div className="container">
          <div className="heading d_flex">
            <div className="heading-left row f_flex">
              <i className="fa fa-border-all"></i>
              <h2>Top Sales</h2>
            </div>
            <div className="heading-right row">
              <Link to="/store?order=numsales">View all</Link>
              <i className="fa fa-caret-right"></i>
            </div>
          </div>
          <TopCard />
        </div>
      </section>
    </>
  );
}

export default TopCate;
