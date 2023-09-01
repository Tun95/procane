import React, { useEffect, useReducer } from "react";
import ShopCard from "./ShopCard";
import "./styles.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { getError } from "../../utilities/util/Utils";

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
function Shop() {
  const navigate = useNavigate();
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });
  //================
  //PRODUCT FETCHING
  //================
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
  return (
    <>
      <section className="shop background" id="shop">
        {products.length > 0 ? (
          <div className="container shop-grid">
            <div className="">
              <div className="heading d_flex">
                <div className="heading-left row  f_flex">
                  <h2>List of Products</h2>
                </div>
                <div className="heading-right row">
                  <a href="#store">
                    <button
                      onClick={() => navigate(`/store`)}
                      className="a_flex view_all"
                    >
                      <span>View all</span>
                      <i className="fa fa-caret-right"></i>
                    </button>
                  </a>
                </div>
              </div>
              <div className="product-content">
                <ShopCard products={products} dispatch={dispatch} />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}

export default Shop;
