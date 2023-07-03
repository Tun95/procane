import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Context } from "../../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../../utilities/util/Utils";
import Rating from "../../utilities/rating/Ratings";
import { request } from "../../../base url/BaseUrl";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";

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
function ShopCard() {
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const { settings } = state;

  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };

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
        const result = await axios.get(`${request}/api/products`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  // const [count, setCount] = useState(0);
  // const increment = () => {
  //   setCount(count + 1);
  // };
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
  };

  return (
    <>
      {products?.slice(0, 8)?.map((product, index) => (
        <div className="box" key={index}>
          <div className="product mtop">
            <div className="img">
              {product.discount > 0 ? (
                <span className="discount">{product.discount}% Off</span>
              ) : null}
              <Link to={`/product/${product.slug}`}>
                <img src={product.image} alt="" />
              </Link>
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
                        product.price - (product.price * product.discount) / 100
                      )}
                    </div>
                    <s className="discounted">
                      {convertCurrency(product.price)}
                    </s>
                  </div>
                ) : (
                  <div className="price">{convertCurrency(product.price)}</div>
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
    </>
  );
}

export default ShopCard;
