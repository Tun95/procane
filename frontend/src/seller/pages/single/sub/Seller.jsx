import React, { useContext, useEffect, useReducer, useState } from "react";
import "./styles.scss";
import photo from "../../../../assets/photo.jpg";
import { Link, useParams } from "react-router-dom";

import axios from "axios";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import Button from "@mui/material/Button";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import Rating from "../../../../components/utilities/rating/Ratings";
import { RWebShare } from "react-web-share";
import ShareIcon from "@mui/icons-material/Share";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SELLER_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SELLER_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_SELLER_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}
function Seller() {
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const { cart: cartItems } = state;
  const params = useParams();

  const { id: sellerId } = params;

  const [{ loading, error, user }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    loadingSeller: false,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${request}/api/users/seller/${sellerId}`
        );
        dispatch({ type: "FETCH_SELLER_SUCCESS", payload: data });
        window.scrollTo(0, 0);
      } catch (err) {
        dispatch({ type: "FETCH_SELLER_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  //Color Style
  const [color, setColor] = useState("");

  //Size state
  const [size, setSize] = useState("");

  //Product Quantity
  const [quantity, setQuantity] = useState(1);

  //ADD TO CART
  const addToCartHandler = async (item) => {
    const { data } = await axios.get(`${request}/api/products/${item._id}`);
    if (cartItems.length > 0 && data.seller._id !== cartItems[0].seller._id) {
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
  };

  //================
  //LOAD MORE
  //================
  const [productsToShow, setProductsToShow] = useState(4);
  const handleLoadMoreClick = () => {
    setProductsToShow((prevCount) => prevCount + 4);
  };
  const handleLoadMore = () => {
    handleLoadMoreClick();
  };

  //PAGE URL
  const pageURL = process.env.REACT_APP_FRONTEND_URL;
  return (
    <div className="mtb">
      <div className="container ">
        <div className="box_shadow seller_product">
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox>{error}</MessageBox>
          ) : (
            <>
              <div className="d_flex sellers_item">
                <div className="light_shadow">
                  <div className="seller_details f_flex">
                    <div className="seller_img">
                      <img
                        src={user?.user?.seller?.logo || photo}
                        alt={user?.user?.seller?.name}
                        className="img"
                      />
                    </div>
                    <div className="seller_info">
                      <div className="seller_name a_flex">
                        <h3>Seller:</h3>
                        <span className="info">{user?.user?.seller?.name}</span>
                      </div>
                      <div className="seller_member a_flex ">
                        <h3>Country:</h3>
                        <span className="info">{user?.user?.country}</span>
                      </div>

                      <div className="seller_member a_flex">
                        <h3>Member Since:</h3>
                        <span className="info">
                          {formatDate(user?.user?.createdAt)}
                        </span>
                      </div>
                      <div className="seller_member a_flex">
                        <h3>Product Reviews:</h3>
                        <span className="info">
                          ({user?.numReviews[0]?.numReviews} reviews)
                        </span>
                      </div>
                      <div className="seller_member a_flex">
                        <h3>Product Ratings:</h3>
                        <span className="info ">
                          (
                          <span className="rate">
                            {user?.rating[0]?.rating?.toFixed(1)}
                          </span>
                          &#160; avg. ratings)
                        </span>
                      </div>
                      <div className="seller_member a_flex">
                        <h3>Items Sold:</h3>
                        <span className="info">
                          ({user?.totalNumSales[0]?.numSales || 0} Items sold so
                          far)
                        </span>
                      </div>
                      <div className="seller_member a_flex">
                        <h3>Contact:</h3>
                        <small className="info">
                          <a
                            href={`mailto:${user?.user?.email}`}
                            className="contact_seller"
                          >
                            Via Email
                          </a>
                        </small>
                      </div>
                      <div className="seller_member a_flex">
                        <h3>Status:</h3>
                        {!user?.user?.isAccountVerified ? (
                          <span className="unverified_account a_flex">
                            unverified seller
                          </span>
                        ) : (
                          <span className="verified_account a_flex">
                            verified seller
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="light_shadow">
                  <div className="bio">
                    <h3>About:</h3>
                    <p>{parse(`<p>${user?.user?.seller?.description}</p>`)} </p>
                  </div>
                </div>
              </div>
              <span className="item_list">
                <div className="product">
                  <h2>PRODUCT LIST</h2>
                </div>
                <div className="list product_content">
                  {user?.user?.products
                    ?.slice(0, productsToShow)
                    .map((product, index) => (
                      <div className="box" key={index}>
                        <div className="product mtop">
                          <div className="img">
                            {product.discount > 0 ? (
                              <span className="discount">
                                {product.discount}% Off
                              </span>
                            ) : null}
                            <Link to={`/product/${product.slug}`}>
                              <img src={product.image} alt="" />
                            </Link>
                            <div className="product-like">
                              {product.flashdeal ? (
                                <i className="fa fa-bolt"></i>
                              ) : (
                                ""
                              )}
                              <span className="related_icon l_flex">
                                <RWebShare
                                  data={{
                                    text: `Check out this cool ${product.name}`,
                                    url: `${pageURL}/product/${product.slug}`,
                                    title: product.name,
                                  }}
                                  onClick={() =>
                                    console.log("shared successfully!")
                                  }
                                >
                                  <ShareIcon className="related_icons" />
                                </RWebShare>
                              </span>
                            </div>
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
                  {productsToShow < user?.user?.products?.length && (
                    <Button
                      variant="outlined"
                      className="muiBtn"
                      onClick={handleLoadMore}
                    >
                      Load More
                    </Button>
                  )}
                </div>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Seller;
