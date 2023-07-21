import React, { useContext, useEffect, useReducer, useState } from "react";
import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MessageBox from "../../../../../components/utilities/message loading/MessageBox";
import axios from "axios";
import { request } from "../../../../../base url/BaseUrl";

function UserOrderList({ convertCurrency, userId, userInfo }) {
  const Button = ({ type }) => {
    return <button className={"widgetLgButton " + type}>{type}</button>;
  };

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          `${request}/api/orders/mine/${userId}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setOrders(data.orders);
      } catch (error) {
        // Handle error
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Tracking ID</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Payment Method</TableCell>
            <TableCell className="tableCell">Delivery Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="tableCenter p_flex">
          {orders?.length === 0 && (
            <span className="product-not">
              <MessageBox>No Orders This Month </MessageBox>
            </span>
          )}
          {orders?.map((order, index) => (
            <TableRow key={index}>
              <TableCell className="tableCell">{order.trackingId}</TableCell>
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

export default UserOrderList;
