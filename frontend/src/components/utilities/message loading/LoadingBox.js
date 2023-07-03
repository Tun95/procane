import React from "react";
import "../style/style.css";

function LoadingBox() {
  return (
    <div id="load-err">
      <div>
        <i className="fa fa-spinner fa-spin"></i>Loading...
      </div>
    </div>
  );
}

export default LoadingBox;
