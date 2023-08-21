import React, { useEffect, useReducer, useRef } from "react";
import DCard from "./DCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
function Discount() {
  const navigate = useNavigate();
  const location = useLocation();
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
        const result = await axios.get(`${request}/api/products/discount`);
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
                <img
                  src="https://img.icons8.com/windows/32/fa314a/gift.png"
                  alt=""
                />

                <h2>Big Discount</h2>
              </div>
              <div className="heading-right row">
                <a href="#store">
                  <button
                    onClick={() =>
                      navigate(`/store?order=discount&discount=50`)
                    }
                    className="a_flex view_all"
                  >
                    <span>View all</span>
                    <i className="fa fa-caret-right"></i>
                  </button>
                </a>
              </div>
            </div>
            <DCard products={products} />
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}

export default Discount;
