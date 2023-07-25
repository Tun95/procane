import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import "./styles.scss";
import { Context } from "../../../context/Context";

import { Link } from "react-router-dom";

function Card({ products }) {
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);

  //===========
  //REACT SLICK
  //===========
  const [slidesToShow, setSlidesToShow] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1200) {
        setSlidesToShow(Math.min(6, products.length));
      } else if (screenWidth >= 992) {
        setSlidesToShow(Math.min(4, products.length));
      } else if (screenWidth >= 768) {
        setSlidesToShow(Math.min(3, products.length));
      } else if (screenWidth >= 555) {
        setSlidesToShow(Math.min(2, products.length));
      } else {
        setSlidesToShow(Math.min(1, products.length));
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  const Slidersettings = {
    dots: true,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      {
        breakpoint: 555,
        settings: {
          dots: false,
        },
      },
    ],
  };

  return (
    <>
      <div className="content  product">
        <Slider {...Slidersettings}>
          {products?.map((product, index) => (
            <div className="box" key={index}>
              <div className="img">
                <Link to={`/product/${product.slug}`}>
                  <img src={product.image} alt="" />
                </Link>
              </div>
              <Link to={`/product/${product.slug}`}>
                <h4>{product.name}</h4>
              </Link>
              {product.discount > 0 ? (
                <div className="a_flex">
                  <div className="price">
                    {convertCurrency(
                      product.price - (product.price * product.discount) / 100
                    )}
                  </div>
                  <s className="discounted">{convertCurrency(product.price)}</s>
                </div>
              ) : (
                <div className="price">{convertCurrency(product.price)}</div>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
}

export default Card;
