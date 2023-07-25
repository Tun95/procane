import React, { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import TopCard from "./TopCard";
import { request } from "../../../base url/BaseUrl";
import axios from "axios";
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
function TopCate() {
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
        const result = await axios.get(`${request}/api/products/top-sales`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <section className=" background newarrivals">
        {products.length > 0 ? (
          <div className="container">
            <div className="heading d_flex">
              <div className="heading-left row f_flex">
                <i className="fa fa-border-all"></i>
                <h2>Best Selling</h2>
              </div>
              <div className="heading-right row">
                <Link to="/store?order=numsales">View all</Link>
                <i className="fa fa-caret-right"></i>
              </div>
            </div>
            <TopCard products={products} />
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}

export default TopCate;
