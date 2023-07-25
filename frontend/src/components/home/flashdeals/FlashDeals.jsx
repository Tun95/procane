import React, { useEffect, useReducer } from "react";
import FlashCard from "./FlashCard";
import "./flash.scss";
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
function FlashDeals() {
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
        const result = await axios.get(`${request}/api/products/flashdeal`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <section className="flash background">
        {products.length > 0 ? (
          <div className="container">
            <div className="heading f_flex">
              <i className="fa fa-bolt"></i>
              <h1>Flash Deals</h1>
            </div>
            <FlashCard products={products} dispatch={dispatch} />
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}

export default FlashDeals;
