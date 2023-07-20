import React, { useContext } from "react";
import Sliderdata from "./Sliserdata.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../context/Context.js";
import { Fade } from "react-awesome-reveal";

function SliderCard() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    // slidesToShow: 1,
    // slidesToScroll: 1,
    autoplay: true,
    appendDots: (dots) => {
      return <ul style={{ margin: "0px" }}>{dots}</ul>;
    },
    responsive: [
      {
        breakpoint: 839,
        settings: {
          dots: false,
        },
      },
    ],
  };

  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { banners } = state;
  return (
    <>
      <Slider {...settings} className="slick-slider">
        {banners?.map((item, index) => (
          <div key={index} className="box d_flex top">
            <div className="left">
              <Fade cascade direction="down" triggerOnce damping={0.3}>
                <h1>{item.title}</h1>
                <p>{item.descriptions}</p>
                <a href="#store">
                  <button
                    onClick={() => navigate(`/store?category=${item.category}`)}
                    className="btn-primary"
                  >
                    Visit Collections
                  </button>
                </a>
              </Fade>
            </div>
            <div className="right">
              <img src={item.background} alt="" />
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
}

export default SliderCard;
