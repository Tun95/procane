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
import "../../styles/styles.scss";
import axios from "axios";
import { getError } from "../../../../../components/utilities/util/Utils";
import { Context } from "../../../../../context/Context";
import MessageBox from "../../../../../components/utilities/message loading/MessageBox";
import { toast } from "react-toastify";
import ReactTimeAgo from "react-time-ago";
import LoadingBox from "../../../../../components/utilities/message loading/LoadingBox";
import { request } from "../../../../../base url/BaseUrl";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

function OrderList(props) {
  const date = new Date();
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders, pages, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const { search } = useLocation();
  // const { pathname } = useLocation();
  const sp = new URLSearchParams(search);
  const page = parseInt(sp.get("page") || 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/orders?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        window.scrollTo(0, 0);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [page, successDelete, userInfo]);
  console.log(orders);

  //======
  //DELETE
  //======
  const deleteHandler = async (order) => {
    if (window.confirm("Are you sure to delete this product?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        await axios.delete(`${request}/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("Order deleted successfully", {
          position: "bottom-center",
        });
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (err) {
        toast.error(getError(err), { position: "bottom-center" });
        dispatch({ type: "DELETE_FAIL" });
      }
    }
  };
  console.log(orders);
  return (
    <div className="container">
      <div className="order-table order_table">
        <h2>All Orders</h2>{" "}
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <TableContainer component={Paper} className="table">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell className="tableCell">Tracking ID</TableCell>
                    <TableCell className="tableCell">User</TableCell>
                    <TableCell className="tableCell">Date</TableCell>
                    <TableCell className="tableCell">Total</TableCell>
                    <TableCell className="tableCell">Paid</TableCell>
                    <TableCell className="tableCell">Delivery Status</TableCell>
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
                      <TableCell className="tableCell">
                        {order.trackingId}
                      </TableCell>
                      <TableCell className="tableCell">
                        {order.user
                          ? order.user.firstName && order.user.lastName
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : "DELETED USER"
                          : "DELETED USER"}
                      </TableCell>
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
                          <div className="paidAt">
                            {formatDate(order.paidAt)}
                          </div>
                        ) : (
                          <div className="negate">No</div>
                        )}
                      </TableCell>
                      <TableCell className="tableCell tableCellPrice">
                        {order.isDelivered ? (
                          <div className="paidAt">
                            {formatDate(order.deliveredAt)}
                          </div>
                        ) : order.isPaid ? (
                          <div className="in_progress">In Progress</div>
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
                        <button
                          className="deleteButton"
                          onClick={() => deleteHandler(order)}
                        >
                          Delete
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
                    to={`/admin/orders?page=${item.page}`}
                    {...item}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderList;
