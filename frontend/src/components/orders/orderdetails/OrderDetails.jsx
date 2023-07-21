import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Context } from "../../../context/Context";
import { request } from "../../../base url/BaseUrl";
import axios from "axios";
import { getError } from "../../utilities/util/Utils";
import { toast } from "react-toastify";
import dateFormat, { masks } from "dateformat";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingBox from "../../utilities/message loading/LoadingBox";
import MessageBox from "../../utilities/message loading/MessageBox";
import { Helmet } from "react-helmet-async";
import "./styles.scss";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case "DELIVER_RESET":
      return { ...state, loadingDeliver: false, errorDeliver: false };
    default:
      return state;
  }
};
function OrderDetails() {
  const navigate = useNavigate();
  const { state, convertCurrency } = useContext(Context);
  const { userInfo, settings } = state;

  const webname = (settings && settings.map((s) => s.webname)) || [];

  const params = useParams();
  const { id: orderId } = params;

  const [{ loading, error, order, loadingDeliver, successDeliver }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: "",
    });

  //=============
  //ORDER DETAILS
  //=============
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${request}/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/signin");
    }

    if (successDeliver) {
      dispatch({ type: "DELIVER_RESET" });
    }
    fetchOrder();
  }, [navigate, orderId, successDeliver, userInfo]);

  //=============
  //ORDER APPROVE
  //=============
  async function deliverOrderHandler() {
    try {
      // dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `${request}/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is delivered successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELIVER_FAIL" });
    }
  }
  //=============
  //PAY FOR ORDER
  //=============
  const payNowHandler = () => {
    navigate(`/payment/${orderId}`);
  };
  console.log(order);

  return (
    <div className="mtb">
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>

      <div className="box_shadow order_details">
        <>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <div className="order-screen">
                <div className="o-screen">
                  <h2 className="order-header">
                    {" "}
                    Tracking ID: {order.trackingId}
                  </h2>
                  <div className="list-box">
                    <div className="order-sec">
                      <div className="order-details">
                        <div className="shipment_summary mb d_flex">
                          <div className="light_shadow a_flex">
                            <div className="info">
                              <h3>Shipping</h3>
                              <div className="order-a-ship">
                                <div className="order-top">
                                  <div>
                                    <label htmlFor="">
                                      <strong>Name: </strong>
                                    </label>
                                    <span>
                                      {order.shippingAddress?.firstName}{" "}
                                      {order.shippingAddress?.lastName}{" "}
                                    </span>
                                  </div>
                                  <div>
                                    <label htmlFor="">
                                      <strong>Address: </strong>
                                    </label>
                                    <span>
                                      {order.shippingAddress?.address},{" "}
                                      {order.shippingAddress?.city},{" "}
                                      {order.shippingAddress?.cState},{" "}
                                      {order.shippingAddress?.zipCode},{" "}
                                      {order.shippingAddress?.country}{" "}
                                    </span>
                                  </div>
                                  <div>
                                    <label htmlFor="">
                                      <strong>Phone: </strong>
                                    </label>
                                    <span>{order.shippingAddress?.phone}</span>
                                  </div>

                                  <div>
                                    <label htmlFor="">
                                      <strong>Shipping Method: </strong>
                                    </label>
                                    <span>
                                      {order.shippingAddress?.shipping}
                                    </span>
                                  </div>
                                </div>
                                <div className="place-deliver c_flex">
                                  <div className="ind-deliver ">
                                    {order.isDelivered ? (
                                      <div className="suc">
                                        <MessageBox variant="success">
                                          Delivered on{" "}
                                          {dateFormat(order.deliveredAt)}
                                        </MessageBox>
                                      </div>
                                    ) : order.isPaid ? (
                                      <MessageBox>In Progress</MessageBox>
                                    ) : (
                                      <MessageBox variant="danger">
                                        Not Delivered
                                      </MessageBox>
                                    )}
                                  </div>
                                  <div>
                                    {userInfo.isAdmin &&
                                    order.isPaid &&
                                    !order.isDelivered ? (
                                      <div className="admin_approve_btn">
                                        <button
                                          type="button"
                                          onClick={deliverOrderHandler}
                                        >
                                          Deliver Order
                                        </button>
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="light_shadow">
                            <TableContainer className="table">
                              <Table aria-label="simple table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      className="tableCell"
                                      colSpan={2}
                                      style={{
                                        fontSize: "18px",
                                        textAlign: "center",
                                      }}
                                    >
                                      Order Summary
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "left" }}
                                    >
                                      Items Price
                                    </TableCell>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "right" }}
                                    >
                                      {convertCurrency(
                                        order.itemsPrice.toFixed(2)
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "left" }}
                                    >
                                      Shipping Price
                                    </TableCell>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "right" }}
                                    >
                                      {convertCurrency(
                                        order.shippingPrice.toFixed(2)
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "left" }}
                                    >
                                      Tax Price
                                    </TableCell>
                                    <TableCell
                                      className="tableCell"
                                      style={{ textAlign: "right" }}
                                    >
                                      {convertCurrency(
                                        order.taxPrice.toFixed(2)
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell
                                      className="tableCell"
                                      style={{
                                        textAlign: "left",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Grand Total
                                    </TableCell>
                                    <TableCell
                                      className="tableCell"
                                      style={{
                                        textAlign: "right",
                                        color: "#f62f5e",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {convertCurrency(
                                        order.grandTotal?.toFixed(2)
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* <table className="order-table-data">
                              <thead>
                                <tr>
                                  <td
                                    className="t-header"
                                    colSpan="2"
                                    align="center"
                                  >
                                    <h2> Order Summary</h2>
                                  </td>
                                </tr>
                              </thead>
                              <tbody cellPadding="3">
                                <tr>
                                  <td className="items-p">Items Price</td>
                                  <td className="items-d">
                                    {convertCurrency(
                                      order.itemsPrice.toFixed(2)
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="items-p">Shipping Price</td>
                                  <td className="items-d">
                                    {convertCurrency(
                                      order.shippingPrice.toFixed(2)
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="items-p">Tax Price</td>
                                  <td className="items-d">
                                    {convertCurrency(order.taxPrice.toFixed(2))}
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong className="items-p grand">
                                      Grand Total
                                    </strong>
                                  </td>
                                  <td className="items-d grand">
                                    <strong>
                                      {convertCurrency(
                                        order.grandTotal?.toFixed(2)
                                      )}
                                    </strong>
                                  </td>
                                </tr>
                              </tbody>
                            </table> */}
                          </div>
                        </div>
                        <div className="sec-box">
                          <h2>Payment</h2>
                          <div className="sec-box-body">
                            <div className="p-method">
                              <strong>Payment Method: </strong>
                              <span className="payment_method">
                                {order.paymentMethod}
                              </span>
                            </div>
                            <br />
                            <div className="p-method">
                              <strong>Status: </strong>
                            </div>
                            <div>
                              {userInfo._id && order.isPaid ? (
                                <MessageBox variant="success">
                                  {order.paymentMethod ===
                                  "Cash on Delivery" ? (
                                    <span className="with_cash">
                                      Paid with Cash on Delivery
                                    </span>
                                  ) : (
                                    <span>
                                      Paid on {dateFormat(order.paidAt)}
                                    </span>
                                  )}
                                </MessageBox>
                              ) : userInfo._id ? (
                                <div className="not-paid-btn">
                                  <MessageBox variant="danger">
                                    Not Paid
                                  </MessageBox>
                                  <button
                                    className="sec-pay-now"
                                    onClick={payNowHandler}
                                  >
                                    Pay Now
                                  </button>
                                </div>
                              ) : (
                                ""
                              )}
                              {/* <button
                                className="sec-pay-now"
                                onClick={handleShipment}
                              >
                                Shipment
                              </button> */}
                            </div>
                          </div>
                        </div>
                        <div className="order-items">
                          <h2>Items</h2>
                          <div className="items-box">
                            <div className="items-box">
                              <TableContainer
                                component={Paper}
                                className="table"
                              >
                                <Table
                                  sx={{ minWidth: 650 }}
                                  aria-label="simple table"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell className="tableCell">
                                        Item Detail
                                      </TableCell>
                                      <TableCell className="tableCell">
                                        Size
                                      </TableCell>
                                      <TableCell className="tableCell">
                                        Seller
                                      </TableCell>
                                      <TableCell className="tableCell">
                                        Quantity
                                      </TableCell>
                                      <TableCell className="tableCell">
                                        Price
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {order.orderItems?.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="tableCell">
                                          <span className="item_details a_flex">
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="order_small_img"
                                            />
                                            <div className="order_name_gen">
                                              <Link
                                                to={`/product/${item.slug}`}
                                              >
                                                <h3>{item.name}</h3>
                                              </Link>
                                              <div className="gen">
                                                {item.keygen}
                                                <img
                                                  src={item.color}
                                                  alt=""
                                                  className="color_image_size"
                                                />
                                              </div>
                                            </div>
                                          </span>
                                        </TableCell>
                                        <TableCell className="tableCell">
                                          {item.size}
                                        </TableCell>
                                        <TableCell className="tableCell">
                                          <span className="seller_name">
                                            {item.sellerName || webname}
                                          </span>
                                        </TableCell>
                                        <TableCell className="tableCell">
                                          <span className="quantity">
                                            {item.quantity}
                                          </span>
                                        </TableCell>
                                        <TableCell className="tableCell">
                                          <div className="order_cart_price">
                                            {item.discount ? (
                                              <div className="cart-price">
                                                {convertCurrency(
                                                  (item.price -
                                                    (item.price *
                                                      item.discount) /
                                                      100) *
                                                    item.quantity
                                                )}
                                              </div>
                                            ) : (
                                              <div className="cart-price">
                                                {convertCurrency(
                                                  item.price.toFixed(0) *
                                                    item.quantity
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
}

export default OrderDetails;
