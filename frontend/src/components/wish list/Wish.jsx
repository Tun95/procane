import React, { useContext, useEffect, useReducer, useState } from "react";
import "./styles.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../utilities/util/Utils";
import { Context } from "../../context/Context";
import { Link, useParams } from "react-router-dom";
import { request } from "../../base url/BaseUrl";
import LoadingBox from "../utilities/message loading/LoadingBox";
import MessageBox from "../utilities/message loading/MessageBox";
import Rating from "../utilities/rating/Ratings";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };
    case "DELETE_RESET":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };

    default:
      return state;
  }
};
function Wish() {
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };

  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const { userInfo } = state;
  const params = useParams();
  const { id: userId } = params;

  const [{ loading, error, user, successDelete }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: "",
      user: [],
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/users/info/${userId}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete, userId, userInfo]);
  console.log(user);

  //==============
  //DELETE PRODUCT
  //==============
  const deleteHandler = async (wish) => {
    try {
      await axios.delete(`${request}/api/wishes/${wish._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("Remove successfully", {
        position: "bottom-center",
      });
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  return (
    <>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          {user?.wish?.length === 0 && (
            <span className="product-not">
              <MessageBox>No Product Found </MessageBox>
            </span>
          )}
          {user?.wish?.map((product, index) => {
            console.log(product.rating);
            return (
              <div className="box" key={index}>
                <div className="product mtop">
                  <div className="img">
                    {product.discount > 0 ? (
                      <span className="discount">{product.discount}% Off</span>
                    ) : null}
                    <Link to={`/product/${product.slug}`}>
                      <img src={product.image} alt="" />
                    </Link>
                    <div className="product-like">
                      {product.flashdeal ? <i className="fa fa-bolt"></i> : ""}
                    </div>
                    {/* <div className="product-like">
                      <label>{count}</label> <br />
                      <i
                        className="fa-regular fa-heart"
                        onClick={increment}
                      ></i>
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
                      <button
                        className="dark-btn"
                        onClick={() => deleteHandler(product)}
                      >
                        <DeleteOutlineIcon className="deleteBtn" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

export default Wish;
