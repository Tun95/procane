import React, { useContext } from "react";
import dateFormat, { masks } from "dateformat";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MessageBox from "../../utilities/message loading/MessageBox";
import { Link } from "react-router-dom";
import { Context } from "../../../context/Context";

function OrderInfo({ orderInfo }) {
  const { state, convertCurrency } = useContext(Context);
  const { userInfo, settings } = state;

  const webname = (settings && settings.map((s) => s.webname)) || [];
  console.log(orderInfo);

  return (
    <div className="order_info">
      {orderInfo ? (
        <div className="light_shadow">
          <>
            <>
              <div className="order-screen">
                <div className="o-screen">
                  <h2 className="order-header">
                    {" "}
                    Tracking ID: {orderInfo.trackingId}
                  </h2>

                  <div className="list-box">
                    <div className="order-sec">
                      <div className="order-details">
                        <div className="top-split">
                          <div className="top-box">
                            <h2>Shipping</h2>
                            <div className="order-a-ship">
                              <div className="order-top">
                                <div>
                                  <label htmlFor="">
                                    <strong>Name: </strong>
                                  </label>
                                  <span>
                                    {orderInfo.shippingAddress?.firstName}{" "}
                                    {orderInfo.shippingAddress?.lastName}{" "}
                                  </span>
                                </div>
                                <div>
                                  <label htmlFor="">
                                    <strong>Address: </strong>
                                  </label>
                                  <span>
                                    {orderInfo.shippingAddress?.address},{" "}
                                    {orderInfo.shippingAddress?.city},{" "}
                                    {orderInfo.shippingAddress?.cState},{" "}
                                    {orderInfo.shippingAddress?.zipCode},{" "}
                                    {orderInfo.shippingAddress?.country}{" "}
                                  </span>
                                </div>
                                <div>
                                  <label htmlFor="">
                                    <strong>Phone: </strong>
                                  </label>
                                  <span>
                                    {orderInfo.shippingAddress?.phone}
                                  </span>
                                </div>

                                <div>
                                  <label htmlFor="">
                                    <strong>Shipping Method: </strong>
                                  </label>
                                  <span>
                                    {orderInfo.shippingAddress?.shipping}
                                  </span>
                                </div>
                              </div>
                              <div className="place-deliver">
                                <div className="ind-deliver">
                                  {orderInfo.isDelivered ? (
                                    <div className="suc">
                                      <MessageBox variant="success">
                                        Delivered on{" "}
                                        {dateFormat(orderInfo.deliveredAt)}
                                      </MessageBox>
                                    </div>
                                  ) : orderInfo.isPaid ? (
                                    <MessageBox>In Progress</MessageBox>
                                  ) : (
                                    <MessageBox variant="danger">
                                      Not Delivered
                                    </MessageBox>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <table className="order-table-data">
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
                                    orderInfo?.itemsPrice?.toFixed(2)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="items-p">Shipping Price</td>
                                <td className="items-d">
                                  {convertCurrency(
                                    orderInfo?.shippingPrice?.toFixed(2)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="items-p">Tax Price</td>
                                <td className="items-d">
                                  {convertCurrency(
                                    orderInfo?.taxPrice?.toFixed(2)
                                  )}
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
                                      orderInfo?.grandTotal?.toFixed(2)
                                    )}
                                  </strong>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="sec-box">
                          <h2>Payment</h2>
                          <div className="sec-box-body">
                            <div className="p-method">
                              <strong>Payment Method: </strong>
                              <span className="payment_method">
                                {orderInfo.paymentMethod}
                              </span>
                            </div>
                            <br />
                            <div className="p-method">
                              <strong>Status: </strong>
                            </div>
                            <div>
                              {userInfo._id && orderInfo.isPaid ? (
                                <MessageBox variant="success">
                                  {orderInfo.paymentMethod ===
                                  "Cash on Delivery" ? (
                                    <span className="with_cash">
                                      Paid with Cash on Delivery
                                    </span>
                                  ) : (
                                    <span>
                                      Paid on {dateFormat(orderInfo.paidAt)}
                                    </span>
                                  )}
                                </MessageBox>
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
                                    {orderInfo?.orderItems?.map(
                                      (item, index) => (
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
                                                    item.price?.toFixed(0) *
                                                      item.quantity
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
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
          </>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default OrderInfo;
