import React from "react";
import "../style/style.css";

function MessageBox(props) {
  return (
    <div id="load-err">
      <div className={`alert alert-${props.variant || "info"}`}>
        {props.children}
      </div>
    </div>
  );
}

export default MessageBox;
