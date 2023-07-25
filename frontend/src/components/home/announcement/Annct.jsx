import React from "react";
import "./styles.scss";
import show from "../../../assets/show/show.png";
import show1 from "../../../assets/show/show1.jpg";

function Annct() {
  return (
    <>
      <section className="annocument background">
        <div className="container d_flex display_grid">
          <div className="img img-1">
            <span className="explore l_flex">
              <h2>Want More!</h2>
            </span>
            <img src={show} width="100%" height="100%" alt="" />
          </div>
          <div className="img img-2">
            <span className="explore l_flex">
              <h2>Our Show Room</h2>
              <p>Explore the vastness of our store</p>
            </span>
            <img src={show1} width="100%" height="100%" alt="" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Annct;
