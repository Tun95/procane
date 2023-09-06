import React, { useContext, useEffect, useReducer, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Helmet } from "react-helmet-async";
import stripe from "../../assets/payment/stripe.png";
import paypal from "../../assets/payment/paypal.png";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import { getError } from "../utilities/util/Utils";
import { toast } from "react-toastify";
import axios from "axios";
import cash from "../../assets/cash.png";
import razorpay from "../../assets/razorpay.png";
import razordark from "../../assets/razordark.png";
import paytm from "../../assets/paytm.png";
import paystackImg from "../../assets/paystack-logo.png";
import paystacklight from "../../assets/paystacklight.png";
import { request } from "../../base url/BaseUrl";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import StripeCheckout from "react-stripe-checkout";
import { PaystackButton } from "react-paystack";
import LoadingBox from "../utilities/message loading/LoadingBox";

const steps = ["Billing Address", "Confirmation", "Payment Method", "Finish"];
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, errorPay: action.payload };

    default:
      return state;
  }
};
function Payment(props) {
  const navigate = useNavigate();

  let PayPal = "PayPal";
  let Stripe = "Stripe";
  let RazorPay = "RazorPay";
  let PayTm = "PayTm";
  let Cash = "Cash on Delivery";
  let PayStack = "PayStack";

  //ORDER POSTING
  const {
    state,
    dispatch: ctxDispatch,
    convertCurrency,
    convertToNumeric,
    toCurrencies,
    darkMode,
  } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems, paymentMethod },
  } = state;
  const { razorkeyid, paytmid, logo, stripePubKey, paystackkey, webname } =
    (settings &&
      settings
        .map((s) => ({
          logo: s.logo,
          razorkeyid: s.razorkeyid,
          paytmid: s.paytmid,
          stripePubKey: s.stripePubKey,
          paystackkey: s.paystackkey,
          webname: s.webname,
        }))
        .find(() => true)) ||
    {};

  //PAYMENT METHOD
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || Stripe
  );
  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
  };
  console.log(paymentMethodName);

  //STRIPE MODAL
  const [openStripeModal, is0penStripeModal] = useState(true);
  const closeStripeModal = () => {
    is0penStripeModal(false);
    document.body.style.overflow = "unset";
  };
  const showStripeModal = () => {
    is0penStripeModal(true);
  };

  const StripeModal = () => {
    closePaypalModal();
    closePayStackModal();
    closeCashModal();
    closePayTmModal();
    closeRazorPayModal();
    showStripeModal();
  };

  //PAYPAL MODAL
  const [openPaypalModal, is0penPaypalModal] = useState(false);
  const closePaypalModal = () => {
    is0penPaypalModal(false);
    document.body.style.overflow = "unset";
  };
  const showPaypalModal = () => {
    is0penPaypalModal(true);
  };

  const PaypalOrderModal = () => {
    showPaypalModal();
    closeStripeModal();
    closeCashModal();
    closeRazorPayModal();
    closePayTmModal();
    closePayStackModal();
  };

  //PAYSTACK MODAL
  const [openPayStackModal, is0penPayStackModal] = useState(false);
  const closePayStackModal = () => {
    is0penPayStackModal(false);
    document.body.style.overflow = "unset";
  };
  const showPayStackModal = () => {
    is0penPayStackModal(true);
  };

  const PayStackOrderModal = () => {
    closeStripeModal();
    closePaypalModal();
    closePayTmModal();
    closeRazorPayModal();
    closeCashModal();
    showPayStackModal();
  };

  //RAZORPAY
  const [openRazorPayModal, is0penRazorPayModal] = useState(false);
  const closeRazorPayModal = () => {
    is0penRazorPayModal(false);
    document.body.style.overflow = "unset";
  };
  const showRazorPayModal = () => {
    is0penRazorPayModal(true);
  };
  const RazorPayOrderModal = () => {
    closeStripeModal();
    closePaypalModal();
    closeCashModal();
    closePayTmModal();
    closePayStackModal();
    showRazorPayModal();
  };

  //PAYTM
  const [openPayTmModal, is0penPayTmModal] = useState(false);
  const closePayTmModal = () => {
    is0penPayTmModal(false);
    document.body.style.overflow = "unset";
  };
  const showPayTmModal = () => {
    is0penPayTmModal(true);
  };

  const PayTmOrderModal = () => {
    closeStripeModal();
    closePaypalModal();
    closeRazorPayModal();
    closeCashModal();
    closePayStackModal();
    showPayTmModal();
  };

  //CASH MODAL
  const [openCashModal, is0penCashModal] = useState(false);
  const closeCashModal = () => {
    is0penCashModal(false);
    document.body.style.overflow = "unset";
  };
  const showCashModal = () => {
    is0penCashModal(true);
  };

  const CashOrderModal = () => {
    closeStripeModal();
    closePaypalModal();
    closeRazorPayModal();
    closePayTmModal();
    closePayStackModal();
    showCashModal();
  };

  //=====================
  //PAYPAL BUTTONS ACTIONS
  //=====================
  const params = useParams();
  const { id: orderId } = params;

  const currencySign = toCurrencies;

  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: "",
      successPay: false,
      loadingPay: false,
    });
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  useEffect(() => {
    if (!userInfo) {
      return navigate("/login");
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
    } else {
      const loadPaypalScript = () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
            currency: toCurrencies,
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [
    navigate,
    order._id,
    orderId,
    paypalDispatch,
    successPay,
    toCurrencies,
    userInfo,
  ]);

  //==========
  //PAYPAL
  //==========
  const PayPalGrandTotal = Number(convertToNumeric(order.grandTotal));
  function createOrder(data, action) {
    return action.order
      .create({
        purchase_units: [{ amount: { value: PayPalGrandTotal } }],
      })
      .then((orderID) => {
        return orderID;
      });
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `${request}/api/orders/${order._id}/pay`,
          { details, paymentMethod: paymentMethodName, currencySign },
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });

        toast.success("Order is paid", { position: "bottom-center" });
        if (order.isPaid) {
          navigate("/finish");
        }
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });

        // Extract PayPal error message from err object
        const errorMessage = extractErrorMessage(err);

        toast.error(errorMessage, { position: "bottom-center" });
      }
    });
  }
  function onError(err) {
    // Extract PayPal error message from err object
    const errorMessage = extractErrorMessage(err);

    toast.error(errorMessage, { position: "bottom-center" });
  }

  // Helper function to extract error message
  function extractErrorMessage(err) {
    if (err.response && err.response.data && err.response.data.details) {
      const firstDetail = err.response.data.details[0];
      if (firstDetail && firstDetail.issue === "CURRENCY_NOT_SUPPORTED") {
        return "Currency not supported";
      }
    }
    return "Currency not supported";
  }

  const submitHandler = (e) => {
    e.preventDefault();
  };

  //==========
  //PAYSTACK
  //==========
  const payStackGrandTotal = Number(convertToNumeric(order.grandTotal));
  const config = {
    reference: new Date().getTime().toString(),
    email: userInfo.email,
    amount: payStackGrandTotal * 100, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    currency: toCurrencies,
    publicKey: paystackkey,
  };
  // you can call this function anything
  const handlePaystackSuccessAction = async (details) => {
    // Implementation for whatever you want to do with reference and after success call.
    try {
      // dispatch({ type: "PAY_REQUEST" });
      const { data } = await axios.put(
        `${request}/api/orders/${order._id}/pay`,
        { details, paymentMethod: paymentMethodName, currencySign },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "PAY_SUCCESS", payload: data });
      toast.success("Order is paid", { position: "bottom-center" });
      if (!order.isPaid) {
        navigate("/finish");
      }
    } catch (err) {
      dispatch({ type: "PAY_FAIL", payload: getError(err) });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  // you can call this function anything
  const handlePaystackCloseAction = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
  };
  const componentProps = {
    ...config,
    text: (
      <span className="paystack_btn_style">
        <img src={paystackImg} alt="" className="paystack_btn_img" />
      </span>
    ),
    onSuccess: (reference) => handlePaystackSuccessAction(reference),
    onClose: handlePaystackCloseAction,
  };

  //============
  // CASH METHOD
  //============
  const cashSubmitHandler = async () => {
    dispatch({ type: "PAY_REQUEST" });
    try {
      await axios.put(
        `${request}/api/orders/${order._id}/pay`,
        {
          paymentMethod: paymentMethodName,
          currencySign,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "PAY_SUCCESS" });
      toast.success("Approved for Cash on Delivery", {
        position: "bottom-center",
      });
      if (!order.isPaid) {
        navigate("/finish");
      }
    } catch (err) {
      dispatch({ type: "PAY_FAIL", payload: getError(err) });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  //=========
  //RAZORPAY
  //=========
  const razorGrandTotal = Number(convertToNumeric(order.grandTotal));
  const razorPaySubmitHandler = async () => {
    dispatch({ type: "PAY_REQUEST" });
    try {
      if (razorGrandTotal > 500000) {
        toast.error("Payment amount exceeds the maximum limit for RazorPay", {
          position: "bottom-center",
        });
        return;
      }
      const response = await fetch(
        `${request}/api/orders/${order._id}/razorpay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: razorGrandTotal,
            currency: toCurrencies,
            paymentMethod: paymentMethodName,
            currencySign: toCurrencies,
          }),
        }
      );

      const razororder = await response.json();

      // Dynamically load the Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: razorkeyid,
          amount: razorGrandTotal * 100,
          currency: toCurrencies,
          name: webname,
          description: `Order payment by ${userInfo.email}`,
          image: logo,
          order_id: razororder.id,
          handler: function (response) {
            if (response.razorpay_payment_id) {
              dispatch({ type: "PAY_REQUEST" });
              toast.success(`${response.razorpay_payment_id} Order is paid`, {
                position: "bottom-center",
              });
              fetch(`${request}/api/orders/${order._id}/razorpay/success`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${userInfo.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    dispatch({ type: "PAY_SUCCESS", payload: response });
                  } else {
                    dispatch({ type: "PAY_FAIL", payload: data.message });
                    toast.error(data.message, { position: "bottom-center" });
                  }
                })
                .catch((error) => {
                  dispatch({ type: "PAY_FAIL", payload: getError(error) });
                  toast.error(getError(error), { position: "bottom-center" });
                });
            } else {
              toast.error("Payment canceled or failed", {
                position: "bottom-center",
              });
            }
          },
          prefill: {
            name: `${userInfo.lastName} ${userInfo.firstName}`,
            email: userInfo.email,
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      dispatch({ type: "PAY_FAIL", payload: getError(error) });
      toast.error(getError(error), { position: "bottom-center" });
    }
  };

  //=======
  // PAYTM
  //=======
  const paytmMerchantId = paytmid;
  const paytmGrandTotal = Number(convertToNumeric(order.grandTotal));
  const payTmSubmitHandler = async () => {
    dispatch({ type: "PAY_REQUEST" });
    try {
      if (paytmGrandTotal > 500000) {
        toast.error("Payment amount exceeds the maximum limit for PayTm", {
          position: "bottom-center",
        });
        return;
      }
      const response = await fetch(`${request}/api/orders/${order._id}/paytm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paytmGrandTotal,
          currency: toCurrencies,
          paymentMethod: paymentMethodName,
          currencySign: toCurrencies,
        }),
      });
      const paytmOrder = await response.json();

      // Initialize the PayTm checkout JS library
      const initializePayTmCheckout = () => {
        window.paytm.startPayment({
          order: {
            orderId: paytmOrder.id,
          },
          handler: function (response) {
            if (response.STATUS === "TXN_SUCCESS") {
              dispatch({ type: "PAY_REQUEST" });
              toast.success(`${response.TXNID} Order is paid`, {
                position: "bottom-center",
              });
              fetch(`${request}/api/orders/${order._id}/paytm/success`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${userInfo.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    dispatch({ type: "PAY_SUCCESS", payload: response });
                  } else {
                    dispatch({ type: "PAY_FAIL", payload: data.message });
                    toast.error(data.message, { position: "bottom-center" });
                  }
                })
                .catch((error) => {
                  dispatch({ type: "PAY_FAIL", payload: getError(error) });
                  toast.error(getError(error), { position: "bottom-center" });
                });
            } else {
              toast.error("Payment canceled or failed", {
                position: "bottom-center",
              });
            }
          },
        });
      };

      // Load PayTm checkout JS library dynamically
      const loadPayTmCheckoutJS = () => {
        const script = document.createElement("script");
        script.src = `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${paytmMerchantId}.js`;
        script.onload = initializePayTmCheckout;
        document.body.appendChild(script);
      };

      loadPayTmCheckoutJS();
    } catch (error) {
      dispatch({ type: "PAY_FAIL", payload: getError(error) });
      toast.error(getError(error), { position: "bottom-center" });
    }
  };

  //=============
  //STRIPE METHOD
  //=============
  const stripePublishableKey = stripePubKey;
  const stripeGrandTotal = Number(convertToNumeric(order.grandTotal));
  const handleStripeToken = async (token) => {
    try {
      dispatch({ type: "PAY_REQUEST" });
      const response = await fetch(
        `${request}/api/orders/${order._id}/stripe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: stripeGrandTotal * 100,
            currency: toCurrencies,
            tokenId: token.id,
            description: `Order payment by ${userInfo.email}`, // Update the token property to tokenId
            currencySign: toCurrencies,
            paymentMethod: paymentMethodName,
          }),
        }
      );
      dispatch({ type: "PAY_SUCCESS", payload: response });
      toast.success("Order is paid", { position: "bottom-center" });
      if (!order.isPaid) {
        navigate("/finish");
      }
    } catch (error) {
      dispatch({ type: "PAY_FAIL", payload: getError(error) });
      toast.error(getError(error), { position: "bottom-center" });
    }
  };

  //Navigation
  useEffect(() => {
    if (order.isPaid) {
      navigate("/finish");
    }
  }, [navigate, cartItems, order.isPaid]);

  return (
    <>
      <div className="form_container">
        <Helmet>
          <title>Checkout</title>
        </Helmet>
        <div className="mtb form_box_content">
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={2} alternativeLabel>
              {steps?.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <span className="labelProps">{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="payment">
            <form action="" onSubmit={submitHandler}>
              <div className="choose_method p_flex">
                <span className="choose_method_box">
                  <div className=" d_grid mtb">
                    <label
                      className={
                        openStripeModal
                          ? "active payment_label"
                          : "payment_label"
                      }
                      htmlFor="stripe"
                      onClick={() => {
                        StripeModal();
                        selectPaymentMethod(Stripe);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          <img src={stripe} alt="" />
                        </div>
                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="stripe"
                            checked={openStripeModal === true}
                            value={Stripe}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2))}
                              &#160; with credit card
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label>
                    <label
                      className={
                        openPaypalModal
                          ? "active payment_label "
                          : "payment_label "
                      }
                      htmlFor="paypal"
                      onClick={() => {
                        PaypalOrderModal();
                        selectPaymentMethod(PayPal);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          <img src={paypal} alt="" />
                        </div>

                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="paypal"
                            value={PayPal}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2)) ||
                                0}{" "}
                              with PayPal
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label>
                    <label
                      className={
                        openRazorPayModal
                          ? "active payment_label "
                          : "payment_label "
                      }
                      onClick={() => {
                        RazorPayOrderModal();
                        selectPaymentMethod(RazorPay);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          {darkMode ? (
                            <img src={razordark} alt="" />
                          ) : (
                            <img src={razorpay} alt="" />
                          )}
                        </div>

                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="razorpay"
                            value={RazorPay}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2)) ||
                                0}
                              with RazorPay
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label>
                    {/* <label
                      className={
                        openPayTmModal
                          ? "active payment_label "
                          : "payment_label "
                      }
                      onClick={() => {
                        PayTmOrderModal();
                        selectPaymentMethod(PayTm);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          <img src={paytm} alt="" />
                        </div>

                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="paytm"
                            value={PayTm}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2)) ||
                                0}{" "}
                              with PayTm
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label> */}

                    <label
                      className={
                        openPayStackModal
                          ? "active payment_label"
                          : "payment_label"
                      }
                      htmlFor="paystack"
                      onClick={() => {
                        PayStackOrderModal();
                        selectPaymentMethod(PayStack);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          {darkMode ? (
                            <img src={paystackImg} alt="" />
                          ) : (
                            <img src={paystacklight} alt="" />
                          )}
                        </div>
                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="paystack"
                            value={PayStack}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2)) ||
                                0}
                              &#160; with PayStack
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label>
                    <label
                      className={
                        openCashModal
                          ? "active payment_label "
                          : "payment_label "
                      }
                      htmlFor="cash"
                      onClick={() => {
                        CashOrderModal();
                        selectPaymentMethod(Cash);
                      }}
                    >
                      <div className="label-svg">
                        <div className="svg">
                          <img src={cash} alt="" className="cash_img" />
                        </div>

                        <span className="a_flex input_text">
                          <input
                            type="radio"
                            required
                            name="payment"
                            id="cash"
                            value={Cash}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>
                            <strong>
                              Pay{" "}
                              {convertCurrency(order.grandTotal?.toFixed(2)) ||
                                0}
                              &#160; with Cash on Delivery
                            </strong>
                          </span>
                        </span>
                      </div>
                    </label>
                  </div>
                  <div className="paypal-stripe">
                    {!order.isPaid ? (
                      <div>
                        {openStripeModal && (
                          <>
                            {loadingPay ? (
                              <div className="paypal-details cursor paystack_btn cash_btn_style">
                                <button
                                  className="cash_btn l_flex "
                                  disabled={loadingPay}
                                >
                                  <React.Fragment>
                                    <LoadingBox></LoadingBox>
                                  </React.Fragment>
                                </button>
                              </div>
                            ) : (
                              <StripeCheckout
                                token={handleStripeToken}
                                stripeKey={stripePublishableKey}
                                amount={stripeGrandTotal * 100}
                                currency={toCurrencies}
                                billingAddress
                                shippingAddress
                                name={webname}
                                description="Order Payment"
                                panelLabel="Pay Now"
                                className="stripe_btn"
                              >
                                <div className="paypal-details paystack_btn cash_btn_style">
                                  <button
                                    className="cash_btn l_flex"
                                    disabled={loadingPay}
                                  >
                                    <React.Fragment>
                                      <img src={stripe} alt="" />
                                    </React.Fragment>
                                  </button>
                                </div>
                              </StripeCheckout>
                            )}
                          </>
                        )}
                        {openPaypalModal && (
                          <div className="paypal-details">
                            <div className="paypal-btn">
                              <PayPalButtons
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                              ></PayPalButtons>
                            </div>
                          </div>
                        )}
                        {openPayStackModal && (
                          <div className="paypal-details paystack_btn">
                            <PaystackButton
                              {...componentProps}
                              className="paystack_btn_style"
                            />
                          </div>
                        )}
                        {openCashModal && (
                          <div className="paypal-details paystack_btn cash_btn_style">
                            <button
                              className="cash_btn l_flex"
                              onClick={cashSubmitHandler}
                              disabled={loadingPay}
                            >
                              {loadingPay ? (
                                <React.Fragment>
                                  <LoadingBox></LoadingBox>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <img src={cash} alt="" />
                                  <span className="cash_text">
                                    Cash on Delivery
                                  </span>
                                </React.Fragment>
                              )}
                            </button>
                          </div>
                        )}
                        {openRazorPayModal && (
                          <div className="paypal-details paystack_btn cash_btn_style">
                            <button
                              className="cash_btn l_flex"
                              onClick={razorPaySubmitHandler}
                              disabled={loadingPay}
                            >
                              {loadingPay ? (
                                <React.Fragment>
                                  <LoadingBox></LoadingBox>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <img src={razordark} alt="" />
                                </React.Fragment>
                              )}
                            </button>
                          </div>
                        )}
                        {/* {openPayTmModal && (
                          <div className="paypal-details paystack_btn cash_btn_style">
                            <button
                              className="cash_btn l_flex"
                              onClick={payTmSubmitHandler}
                              disabled={loadingPay}
                            >
                              {loadingPay ? (
                                <React.Fragment>
                                  <LoadingBox></LoadingBox>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <img src={paytm} alt="" />
                                </React.Fragment>
                              )}
                            </button>
                          </div>
                        )} */}
                      </div>
                    ) : null}
                  </div>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;
