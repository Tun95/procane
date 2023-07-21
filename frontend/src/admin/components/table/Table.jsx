import React, { useContext, useEffect, useReducer } from "react";
import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Context } from "../../../context/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getError } from "../../../components/utilities/util/Utils";
import { request } from "../../../base url/BaseUrl";
import MessageBox from "../../../components/utilities/message loading/MessageBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload.orders };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
function List({ currencySign }) {
  const Button = ({ type }) => {
    return <button className={"widgetLgButton " + type}>{type}</button>;
  };

  const { state, convertCurrency } = useContext(Context);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  //=======
  //ORDERS
  //=======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);
  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Tracking ID</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Payment Method</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="tableCenter p_flex">
          {orders?.length === 0 && (
            <span className="product-not">
              <MessageBox>No Orders This Month </MessageBox>
            </span>
          )}
          {orders?.slice(0, 10).map((order, index) => (
            <TableRow key={index}>
              <TableCell className="tableCell">{order.trackingId}</TableCell>
              <TableCell className="tableCell">
                {order.user
                  ? order.user.firstName && order.user.lastName
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : "DELETED USER"
                  : "DELETED USER"}
              </TableCell>
              <TableCell className="tableCell">
                {order.createdAt.substring(0, 10)}
              </TableCell>
              <TableCell className="tableCell">
                <div className="price">
                  {convertCurrency(order.grandTotal?.toFixed(2))}
                </div>
              </TableCell>
              <TableCell className="tableCell">
                {order.paymentMethod === "Cash on Delivery" ? (
                  <span className="with_cash">With Cash</span>
                ) : order.paymentMethod !== "Cash on Delivery" &&
                  order.isPaid ? (
                  <div className="paidAt">{order.paidAt.substring(0, 10)}</div>
                ) : (
                  <div className="negate">No</div>
                )}
              </TableCell>
              <TableCell className="tableCell">
                {order.isDelivered ? (
                  <Button type="Approved" />
                ) : order.isPaid ? (
                  <Button type="InProgress" />
                ) : (
                  <Button type="Passive" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default List;
