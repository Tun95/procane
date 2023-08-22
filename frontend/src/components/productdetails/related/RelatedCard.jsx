import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Rating from "../../utilities/rating/Ratings";
import { Context } from "../../../context/Context";
import { request } from "../../../base url/BaseUrl";
import { toast } from "react-toastify";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import { RWebShare } from "react-web-share";
import ShareIcon from "@mui/icons-material/Share";

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="control-btn" onClick={onClick}>
      <button className="next">
        <i className="fa fa-long-arrow-alt-right"></i>
      </button>
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="control-btn" onClick={onClick}>
      <button className="prev">
        <i className="fa fa-long-arrow-alt-left"></i>
      </button>
    </div>
  );
};

function RelatedCard({ products, dispatch }) {
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const {
    cart: { cartItems },
  } = state;

  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };

  //===========
  //REACT SLICK
  //===========
  const [slidesToShow, setSlidesToShow] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1200) {
        setSlidesToShow(Math.min(4, products.length));
      } else if (screenWidth >= 992) {
        setSlidesToShow(Math.min(3, products.length));
      } else if (screenWidth >= 650) {
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
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 650,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  //ADD TO CART
  //Color Style
  const [color, setColor] = useState("");

  //Size state
  const [size, setSize] = useState("");

  //Product Quantity
  const [quantity, setQuantity] = useState(1);

  //===========
  //ADD TO CART
  //===========
  const addToCartHandler = async (item) => {
    const { data } = await axios.get(`${request}/api/products/${item._id}`);

    if (
      cartItems.length > 0 &&
      data.seller &&
      data.seller._id !== cartItems[0].seller.id
    ) {
      dispatch({
        type: "CART_ADD_ITEM_FAIL",
        payload: `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
      });
      toast.error(
        `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
        {
          position: "bottom-center",
        }
      );
    } else {
      if (data.countInStock < quantity) {
        toast.error("Sorry, Product stock limit reached or out of stock", {
          position: "bottom-center",
        });
        return;
      } else {
        toast.success(`${item.name} is successfully added to cart`, {
          position: "bottom-center",
        });
      }

      ctxDispatch({
        type: "CART_ADD_ITEM",
        payload: {
          ...item,
          discount: data.discount,
          seller: data.seller,
          sellerName: item?.seller?.seller?.name,
          category: item?.category,
          quantity,
          size,
          color,
        },
      });
    }
  };

  //PAGE URL
  const pageURL = process.env.REACT_APP_FRONTEND_URL;
  return (
    <>
      <Slider {...Slidersettings}>
        {products?.map((product, index) => (
          <div className="box" key={index}>
            <div
              className={
                products.length === 1
                  ? "product product_width mtop"
                  : "product mtop"
              }
            >
              <div className="img">
                {product.discount > 0 ? (
                  <span className="discount">{product.discount}% Off</span>
                ) : null}
                <Link to={`/product/${product.slug}`}>
                  <img src={product.image} alt="" />
                </Link>
                <div className="product-like">
                  {product.flashdeal ? <i className="fa fa-bolt"></i> : ""}
                  <span className="related_icon l_flex">
                    <RWebShare
                      data={{
                        text: `Check out this cool ${product.name}`,
                        url: `${pageURL}/product/${product.slug}`,
                        title: product.name,
                      }}
                      onClick={() => console.log("shared successfully!")}
                    >
                      <ShareIcon className="related_icons" />
                    </RWebShare>
                  </span>
                </div>
                {/* <div className="product-like">
                  <label htmlFor="">{count}</label>
                  <br />
                  <i className="fa-regular fa-heart" onClick={increment}></i>
                </div> */}
              </div>
              <div className="product-details">
                <Link to={`/product/${product.slug}`}>
                  <h3>{product.name}</h3>
                </Link>
                <div className="rate">
                  <Rating rating={product.rating} />
                </div>
                <div className="price">
                  {product.discount > 0 ? (
                    <div className="a_flex">
                      <div className="price">
                        {convertCurrency(
                          product.price -
                            (product.price * product.discount) / 100
                        )}
                      </div>
                      <s className="discounted">
                        {convertCurrency(product.price)}
                      </s>
                    </div>
                  ) : (
                    <div className="price">
                      {convertCurrency(product.price)}
                    </div>
                  )}
                  {product.countInStock === 0 ? (
                    <button className="disabled l_flex" disabled>
                      <DoDisturbIcon className="" />
                    </button>
                  ) : (
                    <button
                      className="dark-btn"
                      onClick={() => addToCartHandler(product)}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
}

export default RelatedCard;
