import React from "react";
import img from "../../../assets/notImg.png";
import { Helmet } from "react-helmet-async";

function NotFoundScreen() {
  return (
    <div className="container">
      <Helmet>
        <title>Error 404</title>
      </Helmet>
      <div className="page_not_found l_flex">
        <div className="a_flex">
          <img src={img} alt="" />
          <span className="found_text">
            <h1 className="head_size">404</h1>
            <h1>Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </span>
        </div>
      </div>
    </div>
  );
}

export default NotFoundScreen;
