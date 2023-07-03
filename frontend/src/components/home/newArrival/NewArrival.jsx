import React from "react";
import Card from "./Card";
import { Link } from "react-router-dom";

function NewArrival() {
  return (
    <>
      <section className="newarrivals background">
        <div className="container">
          <div className="heading d_flex">
            <div className="heading-left row f_flex">
              <img
                src="https://img.icons8.com/glyph-neue/64/26e07f/new.png"
                alt=""
              />
              <h2>New Arrivals</h2>
            </div>
            <div className="heading-right row">
              <Link to="/store">View all</Link>
              <i className="fa fa-caret-right"></i>
            </div>
          </div>
          <Card />
        </div>
      </section>
    </>
  );
}

export default NewArrival;
