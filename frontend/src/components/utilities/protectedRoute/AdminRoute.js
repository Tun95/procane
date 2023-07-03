import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../../../context/Context";

export default function AdminRoute({ children }) {
  const { state } = useContext(Context);

  const { userInfo } = state;
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}
