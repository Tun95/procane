import React, { useContext, useEffect, useReducer, useState } from "react";
import Details from "../../components/productdetails/detail/Details";
import ReviewDesc from "../../components/productdetails/review/ReviewDesc";
import Related from "../../components/productdetails/related/Related";
import { useParams } from "react-router-dom";
import { request } from "../../base url/BaseUrl";
import axios from "axios";
import { getError } from "../../components/utilities/util/Utils";
import LoadingBox from "../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../components/utilities/message loading/MessageBox";
import "./styles.scss";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const reducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_PRODUCT":
      return { ...state, product: action.payload, loading: true };
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };

    case "CREATE_REQUEST":
      return { ...state, loadingCreateReview: true, successCreate: false };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreateReview: false, successCreate: true };
    case "CREATE_FAIL":
      return { ...state, loadingCreateReview: false, successCreate: false };

    case "FETCH_SIM_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SIM_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_SIM_FAIL":
      return { ...state, error: action.payload, loading: false };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};
function ProductDetailScreen({ productItems, onAdd }) {
  const params = useParams();
  const { slug } = params;
  //Product Quantity
  const [quantity, setQuantity] = useState(1);
  //==========
  //CONTEXT
  //==========
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const {
    cart: { cartItems },
    userInfo,
    settings,
  } = state;

  const [{ loading, error, products, product, successDelete }, dispatch] =
    useReducer(reducer, {
      products: [],
      product: [],
      loading: true,
      error: "",
    });
  //=====================
  //FETCH  PRODUCT
  //=====================
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get(`${request}/api/products/slug/${slug}`);

        dispatch({ type: "FETCH_SUCCESS", payload: result.data });

        window.scrollTo(0, 0);
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [slug, successDelete]);

  //=====================
  //FETCH RELATED PRODUCTS
  //=====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
          `${request}/api/products/related/${product._id}`
        );
        dispatch({ type: "FETCH_SIM_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({ type: "FETCH_SIM_FAIL", payload: error.message });
      }
    };

    fetchData();
  }, [product._id, product.id]);
  console.log(products);

  //==========
  //ADD TO CART
  //===========
  const addToCartHandler = async () => {
    const { data } = await axios.get(`${request}/api/products/${product._id}`);

    toast.success(`${product.name} is successfully added to cart`, {
      position: "bottom-center",
    });

    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: {
        ...product,
        seller: data.seller,
        sellerName: product?.seller?.seller?.name,
        category: product?.category,
      },
    });
    localStorage.setItem("cartItems", JSON.stringify(state.cart.cartItems));
  };

  //====================
  //DELETE REVIEW
  //====================
  const handleDelete = async (reviewId) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      const response = await axios.delete(
        `${request}/api/products/${product._id}/reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELETE_SUCCESS" });
      if (response.status === 200) {
        // Handle successful deletion
        toast.success("Review deleted successfully", {
          position: "bottom-center",
        });
        // Perform additional actions, such as updating the UI or fetching updated data
        // onDelete();
      }
    } catch (error) {
      // Handle deletion error
      toast.error(getError(error), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  return (
    <div className="background product-details-page">
      <div className="container  ">
        <Helmet>
          <title>{product?.name}</title>
        </Helmet>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <Details product={product} dispatch={dispatch} />
            <ReviewDesc
              handleDelete={handleDelete}
              product={product}
              userInfo={userInfo}
            />
            {products.length !== 0 ? (
              <Related
                products={products}
                addToCartHandler={addToCartHandler}
              />
            ) : (
              ""
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductDetailScreen;
