import React, { useContext, useEffect, useState } from "react";
import "../styles/styles.scss";
import Rating from "../../utilities/rating/Ratings";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { Context } from "../../../context/Context";
import { toast } from "react-toastify";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { red } from "@mui/material/colors";
import { getError } from "../../utilities/util/Utils";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

function Details({ product }) {
  const smallSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
  };

  //Image Selection
  const [selectedImage, setSelectedImage] = useState(product.image);

  //Color Style
  const [color, setColor] = useState("");

  //Size state
  const [size, setSize] = useState("");

  //Product Quantity
  const [quantity, setQuantity] = useState(1);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 210,
      },
    },
  };

  //==========
  //CONTEXT
  //==========
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const {
    cart: { cartItems },
    userInfo,
  } = state;

  //===========
  // QUANTITY
  //===========
  const [count, setCount] = useState(1);
  const maxAmount = product?.countInStock; // Specify the maximum amount
  const minAmount = 1; // Specify the minimum amount

  const increment = () => {
    if (count < maxAmount) {
      setCount(count + 1);
    }
  };

  const decrement = () => {
    if (count > minAmount) {
      setCount(count - 1);
    }
  };

  //==========
  //ADD TO CART
  //===========
  const addToCartHandler = async () => {
    const { data } = await axios.get(`${request}/api/products/${product._id}`);

    // if (cartItems.length > 0 && data.seller._id !== cartItems[0].seller._id) {
    //   dispatch({
    //     type: "CART_ADD_ITEM_FAIL",
    //     payload: `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
    //   });
    //   toast.error(
    //     `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
    //     {
    //       position: "bottom-center",
    //     }
    //   );
    // } else {
    if (data.countInStock < count) {
      toast.error("Sorry, Product stock limit reached or out of stock", {
        position: "bottom-center",
      });
      return;
    } else {
      toast.success(`${product.name} is successfully added to cart`, {
        position: "bottom-center",
      });
    }

    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: {
        ...product,
        seller: data.seller,
        sellerName: product?.seller?.seller?.name,
        category: product?.category,
        quantity: count,
        size,
        color,
      },
    });
    localStorage.setItem("cartItems", JSON.stringify(state.cart.cartItems));
  };

  console.log(product);

  //==============
  //ADD TO WISH LIST
  //================
  const [checked, setChecked] = useState(false);
  const handleCheckboxSubmit = async () => {
    if (!userInfo) {
      toast.error("Please log in first", { position: "bottom-center" });
    } else {
      try {
        const response = await axios.post(
          `${request}/api/wishes/post`,
          {
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            rating: product.rating,
            flashdeal: product.flashdeal,
            discount: product.discount,
            product: product._id,
            checked: !checked, // Toggle the checked state
            // Add other wish details as needed
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("Added to wish list successfully", {
          position: "bottom-center",
        });
        setChecked(!checked); // Update the checked state
        console.log(response.data); // Optional: Handle the response as needed
      } catch (error) {
        toast.error(getError(error), { position: "bottom-center" });
        console.error(error);
      }
    }
  };
  useEffect(() => {
    const checkProductInWishList = async () => {
      if (!userInfo) return;
      try {
        const response = await axios.get(
          `${request}/api/wishes/product/${product._id}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setChecked(response.data.exists); // Set the checked state based on the response
      } catch (error) {
        console.error(error);
      }
    };
    checkProductInWishList();
  }, [userInfo, product]);

  return (
    <>
      <section className="  details ">
        <div className="l_flex">
          <div className="p-width">
            <div className="images">
              <div className="img">
                <div className="img_large">
                  <img src={selectedImage || product.image} alt="" />
                </div>
                <div className="img_small">
                  <div className="image-selected-preview-prod">
                    <Slider {...smallSettings} className="">
                      {[product.image, ...product.images].map((x) => (
                        <div className="small_img_slide" key={x}>
                          <span
                            onClick={() => setSelectedImage(x)}
                            className={`${
                              x === selectedImage ? "selected_image" : ""
                            }`}
                          >
                            <img src={x} alt="" />
                          </span>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
            </div>
            <div className="product-details">
              <div className="cat">
                <span>Category: </span>
                {product.category?.slice(0, 2)?.map((c, index) => (
                  <small key={index}>{c},</small>
                ))}
              </div>
              <div className="det-header ">
                <h2>{product.name}</h2>
              </div>
              <div className="sold a_flex">
                <div className="countInstock">
                  {product.countInStock === 0 ? (
                    <small className="danger">Unavailable</small>
                  ) : (
                    <small className="in_stock">
                      <span>({product?.countInStock})</span> In Stock
                    </small>
                  )}
                </div>
                <small>({product.numSales} Item sold so far)</small>
              </div>
              {product.seller ? (
                <div className="seller_link">
                  <small>
                    seller:{" "}
                    <Link to={`/vendor-products/${product?.seller?._id}`}>
                      {product?.seller?.seller?.name}
                    </Link>
                  </small>
                </div>
              ) : null}
              <div className="rate-num f_flex">
                <div className="rate">
                  <Rating rating={product.rating}></Rating>
                </div>
                <div className="num-count">
                  ( <span>{product.rating?.toFixed(1)}</span> avg. ratings )
                </div>
              </div>
              <div className="price a_flex">
                <label htmlFor="">Price: </label>

                <span className="product_price">
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
                </span>
              </div>
              <div className="color">
                <label htmlFor="">Color: </label>
                <ul>
                  {product.color?.map((c, index) => (
                    <li
                      key={index}
                      onClick={() => setColor(c)}
                      className={`${color === c ? "active" : ""}`}
                    >
                      <img src={c} alt={c} className="color_image_size" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="size">
                <label htmlFor="">Size: </label>
                <FormControl
                  variant="filled"
                  size="small"
                  className="formControl"
                  id="formControl"
                >
                  <Select
                    labelId="mui-simple-select-label"
                    id="mui_simple_select"
                    className="mui_simple_select"
                    // multiple
                    MenuProps={MenuProps}
                    SelectDisplayProps={{
                      style: { paddingTop: 8, paddingBottom: 8 },
                    }}
                    value={size}
                    label={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    {product.size?.map((s, index) => (
                      <MenuItem id="menu_item" key={index} value={s}>
                        <small className="">{s}</small>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="quantity .a_flex">
                <label htmlFor="">Quantity: </label>
                <div className="a_flex">
                  <button onClick={decrement}>
                    <i className="fa fa-minus"></i>
                  </button>
                  <span className="qty l_flex">{count}</span>
                  <button onClick={increment}>
                    <i className="fa fa-plus"></i>
                  </button>
                </div>
              </div>
              {/* <div className="desc">
                <label htmlFor="">Description: </label>
                <p>{product.desc}</p>
              </div> */}
              <div className="addtocart c_flex">
                <div className="button">
                  {product.countInStock === 0 ? (
                    <button disabled className="out-o-stock">
                      Out of Stock
                    </button>
                  ) : (
                    <span>
                      <button
                        className="add-to-cart"
                        onClick={addToCartHandler}
                      >
                        Add to cart
                      </button>
                    </span>
                  )}
                </div>
                <div className="add_wish">
                  <small>Add to wish</small>
                  <Checkbox
                    {...label}
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite />}
                    sx={{
                      color: red[800],
                      "&.Mui-checked": {
                        color: red[600],
                      },
                    }}
                    checked={checked}
                    onChange={handleCheckboxSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Details;
