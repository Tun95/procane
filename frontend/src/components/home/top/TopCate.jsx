import React, { useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopCard from "./TopCard";
import { request } from "../../../base url/BaseUrl";
import axios from "axios";
import { getError } from "../../utilities/util/Utils";
import "./styles.scss";

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
  const navigate = useNavigate();
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
      <section className=" background newarrivals topCat">
        {products.length > 0 ? (
          <div className="container">
            <div className="heading c_flex">
              <div className="heading-left row f_flex">
                <i className="fa fa-border-all"></i>
                <h2>Best Selling</h2>
              </div>
              <div className="heading-right row">
                <a href="#store">
                  <button
                    onClick={() => navigate(`/store?order=numsales`)}
                    className="a_flex view_all"
                  >
                    <span>View all</span>
                    <i className="fa fa-caret-right"></i>
                  </button>
                </a>
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
