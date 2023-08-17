import React, { useContext } from "react";
import LoadingOverlay from "react-loading-overlay";
import { Context } from "../../../context/Context";
import "../style/style.css";

function LoadingOverlayComponent({ children, center }) {
  const { state } = useContext(Context);
  const { loading } = state;

  const overlayStyle = center
    ? { display: "flex", justifyContent: "center", alignItems: "center" }
    : {};

  return (
    <LoadingOverlay
      style={overlayStyle}
      active={loading}
      spinner
      text="Loading..."
    >
      {children}
    </LoadingOverlay>
  );
}

export default LoadingOverlayComponent;
