import React, { useContext, useEffect, useReducer } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./styles.scss";
import axios from "axios";
import { Context } from "../../../context/Context";
import { getError } from "../../utilities/util/Utils";
import { request } from "../../../base url/BaseUrl";
import LoadingBox from "../../utilities/message loading/LoadingBox";
import MessageBox from "../../utilities/message loading/MessageBox";
import ReactTimeAgo from "react-time-ago";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        error: "",
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

function OrderHistory() {
  const date = new Date();
  const { state, convertCurrency } = useContext(Context);
  const { userInfo } = state;

  const navigate = useNavigate();

  const [{ loading, error, orders, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = parseInt(sp.get("page") || 1);

  //==========
  // ORDERS
  //==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${request}/api/orders/mine?page=${page}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        window.scrollTo(0, 0);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!userInfo) {
      return navigate("/login");
    }
    fetchData();
  }, [userInfo, navigate, page]);

  return (
    <div className="order-table">
      <h2>Order History</h2>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <TableContainer component={Paper} className="table">
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className="tableCell">Tracking ID</TableCell>
                  <TableCell className="tableCell">Date</TableCell>
                  <TableCell className="tableCell">Total</TableCell>
                  <TableCell className="tableCell">Paid</TableCell>
                  <TableCell className="tableCell">Delivered</TableCell>
                  <TableCell className="tableCell">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.length === 0 && (
                  <div className="product_not">
                    <span className="product-not">
                      <MessageBox>No Orders Found </MessageBox>
                    </span>
                  </div>
                )}
                {orders?.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="tableCell">{order._id}</TableCell>
                    <TableCell className="tableCell">
                      <div className="cellWrapper">
                        <ReactTimeAgo
                          date={Date.parse(order.createdAt)}
                          locale="en-US"
                        />
                      </div>
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
                        <div className="paidAt">{formatDate(order.paidAt)}</div>
                      ) : (
                        <div className="negate">No</div>
                      )}
                    </TableCell>
                    <TableCell className="tableCell tableCellPrice">
                      {order.isDelivered ? (
                        <div className="paidAt">
                          {formatDate(order.deliveredAt)}
                        </div>
                      ) : (
                        <div className="negate">No</div>
                      )}
                    </TableCell>
                    <TableCell className="tableCell">
                      <button
                        className="tableBtn"
                        onClick={() => {
                          navigate(`/order-details/${order._id}`);
                        }}
                      >
                        Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="pagination p_flex">
            <Pagination
              page={page}
              count={pages}
              renderItem={(item) => (
                <PaginationItem
                  className={`${
                    item.page !== page
                      ? "paginationItemStyle"
                      : "paginationItemStyle active"
                  }`}
                  component={Link}
                  to={`/track-order?page=${item.page}`}
                  {...item}
                />
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default OrderHistory;
