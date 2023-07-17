import React, { useContext } from "react";
import "./styles.scss";
import { Context } from "../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../base url/BaseUrl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CloseIcon from "@mui/icons-material/Close";
import { Helmet } from "react-helmet-async";

function Cart() {
  //FETCHING CARTITEMS
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems },
  } = state;

  //============
  //CART QUANTITY
  //============
 const updateCartHandler = async (item, quantity) => {
   const { data } = await axios.get(`${request}/api/products/${item._id}`);
   if (data.countInStock < quantity) {
     window.alert("Sorry, Product is out of stock");
     return;
   }
   ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...item, quantity } });
 };


  //============
  //REMOVE ITEMS
  //============
  const removeItemHandler = (item) => {
    ctxDispatch({
      type: "CART_REMOVE_ITEM",
      payload: { _id: item._id, size: item.size, color: item.color },
    });
    toast.error(`${item.name} is successfully removed from cart`, {
      position: "bottom-center",
    });
  };

  // const removeItemHandler = (item) => {
  //   ctxDispatch({ type: "CART_REMOVE_ITEM", payload: item });
  //   toast.error(`${item.name} is successfully removed from cart`, {
  //     position: "bottom-center",
  //   });
  // };

  //========
  //CHECKOUT
  //========
  const navigate = useNavigate();
  const checkoutHandler = () => {
    if (!userInfo) {
      toast.error("You need to log in to proceed to checkout", {
        position: "bottom-center",
      });
      navigate("/login?redirect=/billing");
    } else {
      navigate("/billing");
    }
  };


  console.log(cartItems);

  const totalPrice = cartItems.reduce(
    (a, c) => a + (c.price - (c.price * c.discount) / 100) * c.quantity,
    0
  );
  return (
    <>
      <Helmet>
        <title>Cart</title>
      </Helmet>
      <section className="cart-items mtb">
        <div className="container d_flex cart-wrap">
          <div className="cart-details ">
            <div className="cart-list product">
              <TableContainer className=" table">
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="tableCell">
                        Item Discription
                      </TableCell>
                      <TableCell className="tableCell">Size</TableCell>
                      <TableCell className="tableCell third_qty">
                        Quantity
                      </TableCell>
                      <TableCell className="tableCell">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  {cartItems.length === 0 && (
                    <h1 className="no-items ">Cart Is Empty</h1>
                  )}
                  <TableBody>
                    {cartItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="tableCell">
                          <div className="first-row">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="small"
                            />
                            <div className="name-gen">
                              <Link to={`/product/${item.slug}`}>
                                <h3>{item.name}</h3>
                              </Link>
                              <div className="gen">
                                {item.keygen}
                                {/* CHECK */}{" "}
                                <img
                                  src={item.color}
                                  alt={item.color}
                                  className="color_image_size"
                                />
                              </div>
                              <span
                                onClick={() => removeItemHandler(item)}
                                className="remove-item"
                              >
                                <CloseIcon className="close-reg" />
                                <span className="remove-text">Remove</span>
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="tableCell">
                          <div className="second-row">
                            <div className="clothe-size">
                              {item.size === "" ? "" : item.size}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="tableCell">
                          {" "}
                          <div className="third-row l_flex">
                            <button
                              disabled={item.quantity === 1}
                              onClick={() =>
                                updateCartHandler(item, item.quantity - 1)
                              }
                              className="remove-from"
                            >
                              -
                            </button>
                            <div className="quantity">
                              <span className="l_flex">{item.quantity}</span>
                            </div>
                            <button
                              disabled={item.quantity === item.countInStock}
                              onClick={() =>
                                updateCartHandler(item, item.quantity + 1)
                              }
                              className="add-to"
                            >
                              +
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="tableCell">
                          <div className="forth-row" key={index}>
                            {item.discount ? (
                              <>
                                <div className="cart-price" key={index}>
                                  {convertCurrency(
                                    (
                                      item.price -
                                      (item.price * item.discount) / 100
                                    ).toFixed(0) * item.quantity
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="cart-price">
                                {convertCurrency(
                                  item.price.toFixed(0) * item.quantity
                                )}
                              </div>
                            )}
                          </div>{" "}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>

          <div className="cart-total product">
            <h2>Cart Summary</h2>
            <div>
              <h3>
                <>{cartItems.reduce((a, c) => a + c.quantity, 0)}</> Items In
                Your Cart
              </h3>
            </div>
            <div className=" d_flex">
              <h4>Total Price :</h4>
              <span className="price">
                {" "}
                {convertCurrency(totalPrice.toFixed(2))}
              </span>
            </div>
            {cartItems.length !== 0 ? (
              <div className="table-footer">
                <div className="check-shop">
                  {/* <div className="shop-now">
                    <Link to="/store">
                      <button className="main_btn">Back to Shop</button>
                    </Link>
                  </div> */}
                  <div className="checkout">
                    <button
                      disabled={cartItems.length === 0}
                      className="checkout main_btn"
                      onClick={checkoutHandler}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Cart;
