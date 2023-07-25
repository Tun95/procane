import React, { useEffect, useReducer } from "react";
import Card from "./Card";
import { Link } from "react-router-dom";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, products: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
function NewArrival() {
  const [{ products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });

  //==============
  //FETCH PRODUCTS
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/products/new-arrival`);
        dispatch({
          type: "FETCH_SUCCESS",
          payload: data,
        });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL" });
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <section className="newarrivals background">
        {products.length > 0 ? (
          <div className="container">
            <div className="heading d_flex">
              <div className="heading-left row f_flex">
                <img
                  src="https://img.icons8.com/glyph-neue/64/26e07f/new.png"
                  alt=""
                />
                <h2>New Arrivals</h2>
              </div>
              <div className="heading-right row">
                <Link to="/store">View all</Link>
                <i className="fa fa-caret-right"></i>
              </div>
            </div>
            <Card products={products} />
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}

export default NewArrival;
