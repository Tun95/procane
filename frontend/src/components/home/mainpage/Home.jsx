import React from "react";
import Categories from "./Categories";
import "./styles.scss";
import Slider from "./Slider";

function Home() {
  return (
    <>
      <section className="store_home">
        <span className="container display_grid d_flex slider_cate">
          <Categories />
          <Slider />
        </span>
      </section>
    </>
  );
}

export default Home;
