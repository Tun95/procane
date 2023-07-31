import React, { useEffect, useReducer } from "react";
import "./styles.css";
import { Fade } from "react-awesome-reveal";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { getError } from "../../utilities/util/Utils";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, wrappers: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Wrapper() {
  const [{ loading, error, wrappers }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    wrappers: [],
  });

  //===============
  //FETCH ALL BRANDS
  //===============
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/wrappers`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <section className="wrapper background">
        <div className="container wrapper-grid">
          {wrappers?.map((wrapperData) => (
            <span key={wrapperData._id}>
              {wrapperData.wrappers.map((wrapper, index) => (
                <div className="product" key={index}>
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <div className="img icon-circle">
                      <i className={wrapper.icon}></i>
                    </div>
                    <h3>{wrapper.header}</h3>
                    <p>{wrapper.description}</p>
                  </Fade>
                </div>
              ))}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

export default Wrapper;
