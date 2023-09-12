import React, { useContext } from "react";
import LoadingOverlay from "react-loading-overlay";
import { Context } from "../../../context/Context";
import "../style/style.css";

function LoadingOverlayComponent({ children, center }) {
  const { state } = useContext(Context);
  const { loading } = state;

  return (
    <LoadingOverlay active={loading} spinner text="Loading...">
      {children}
    </LoadingOverlay>
  );
}

export default LoadingOverlayComponent;
