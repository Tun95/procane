import React, { useContext, useEffect, useReducer } from "react";
import Details from "../../components/productdetails/detail/Details";
import ReviewDesc from "../../components/productdetails/review/ReviewDesc";
import Related from "../../components/productdetails/related/Related";
import { useParams, useLocation } from "react-router-dom";
import { request } from "../../base url/BaseUrl";
import axios from "axios";
import { getError } from "../../components/utilities/util/Utils";
import LoadingBox from "../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../components/utilities/message loading/MessageBox";
import "./styles.scss";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const initialState = {
  products: [],
  product: null,
  loading: true,
  error: "",
  loadingCreateReview: false,
  successCreate: false,
  successDelete: false,
  loadingDelete: false,
};

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
    case "CREATE_RESET":
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

  const { state: cState, dispatch: ctxDispatch } = useContext(Context);
  const {
    cart: { cartItems },
    userInfo,
    settings,
  } = cState;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { loading, error, products, product, successDelete, successCreate } =
    state;

  const location = useLocation();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const affiliateCode = searchParams.get("affiliateCode");

  //=======================
  // FETCH PRODUCT DETAILS
  //=======================
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const affiliateCode = searchParams.get("affiliateCode");

    const fetchData = async () => {
      try {
        const result = await axios.get(
          `${request}/api/products/slug/${slug}${
            affiliateCode ? `?affiliateCode=${affiliateCode}` : ""
          }`
        );

        if (result.data.product) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data.product });
        } else {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching product details:", error);
        dispatch({
          type: "FETCH_FAIL",
          payload: "Error fetching product details",
        });
      }
    };
    if (successCreate || successDelete) {
      dispatch({ type: "CREATE_RESET" });
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [slug, location.search, successDelete, successCreate]);

  //=======================
  // FETCH RELATED PRODUCTS
  //=======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (product && product._id) {
          const result = await axios.get(
            `${request}/api/products/related/${product._id}`
          );
          dispatch({ type: "FETCH_SIM_SUCCESS", payload: result.data });
        }
      } catch (error) {
        dispatch({ type: "FETCH_SIM_FAIL", payload: error.message });
      }
    };

    fetchData();
  }, [product]);

  //=======================
  // ADD TO CART
  //=======================
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
      // Calculate the affiliate commission based on the product price and the affiliate commission rate
      const affiliateCommission = item.price * data.affiliateCommissionRate;

      toast.success(`${item.name} is successfully added to cart`, {
        position: "bottom-center",
      });
      ctxDispatch({
        type: "CART_ADD_ITEM",
        payload: {
          ...item,
          discount: data.discount,
          seller: data.seller,
          sellerName: item?.seller?.seller?.name,
          category: item?.category,
          affiliateCommission,
        },
      });
    }
  };

  //=======================
  // DELETE REVIEWS
  //=======================
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
        toast.success("Review deleted successfully", {
          position: "bottom-center",
        });
      }
    } catch (error) {
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
            <Details
              product={product}
              affiliateCode={affiliateCode}
              dispatch={dispatch}
            />
            <ReviewDesc
              handleDelete={handleDelete}
              product={product}
              userInfo={userInfo}
              dispatch={dispatch}
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
