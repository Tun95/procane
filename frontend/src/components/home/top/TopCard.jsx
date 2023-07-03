import React, { useContext, useEffect, useReducer, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { getError } from "../../utilities/util/Utils";
import { Context } from "../../../context/Context";
import { Link } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};
function TopCard() {
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });
  //============
  //PRODUCT FETCHING
  //============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(`${request}/api/products/top-sales`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

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
    speed: 500,
    arrows: false,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
  };
  return (
    <>
      <Slider {...Slidersettings}>
        {products?.map((product, index) => (
          <div className="box product" key={index}>
            <div className="img">
              <Link to={`/product/${product.slug}`}>
                <img src={product.image} alt="" />
              </Link>
            </div>
            <Link to={`/product/${product.slug}`}>
              <h4>{product.name}</h4>
            </Link>
            <span>
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
            </span>
          </div>
        ))}
      </Slider>
    </>
  );
}

export default TopCard;
