import React, { useContext } from "react";
import LoadingOverlay from "react-loading-overlay";
import { Context } from "../../../context/Context";

function LoadingOverlayComponent({ children }) {
  const { state } = useContext(Context);
  const { loading } = state;

  return (
    <LoadingOverlay active={loading} spinner text="Loading...">
      {children}
    </LoadingOverlay>
  );
}

export default LoadingOverlayComponent;
