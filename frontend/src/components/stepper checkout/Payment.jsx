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
    toCurrency,
    darkMode,
  } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems, paymentMethod },
  } = state;
  const { razorkeyid, paytmid } =
    (settings &&
      settings
        .map((s) => ({
          razorkeyid: s.razorkeyid,
          paytmid: s.paytmid,
        }))
        .find(() => true)) ||
    {};

  //PAYMENT METHOD
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || PayPal
  );
  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
  };
  console.log(paymentMethodName);

  //STRIPE MODAL
  const [openStripeModal, is0penStripeModal] = useState(false);
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
  const [openPaypalModal, is0penPaypalModal] = useState(true);
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

  const currencySign = toCurrency;

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
            currency: toCurrency,
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
    toCurrency,
    userInfo,
  ]);

  //==========
  //PAYPAL
  //==========
  function createOrder(data, action) {
    return action.order
      .create({
        purchase_units: [{ amount: { value: order.grandTotal } }],
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
        toast.error(getError(err), { position: "bottom-center" });
      }
    });
  }
  function onError(err) {
    toast.error(getError(err), { position: "bottom-center" });
  }

  const submitHandler = (e) => {
    e.preventDefault();
    // ctxDispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethodName });
    // localStorage.setItem("paymentMethod", paymentMethodName);
  };

  //==========
  //PAYSTACK
  //==========
  const payStackGrandTotal = Number(convertToNumeric(order.grandTotal));
  const config = {
    reference: new Date().getTime().toString(),
    email: userInfo.email,
    amount: payStackGrandTotal * 100, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    currency: toCurrency,
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
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
  // const conversionRate = settings
  //   ?.map((s) => Number(s.rate))
  //   ?.find((rate) => !isNaN(rate));
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
            currency: toCurrency,
            paymentMethod: paymentMethodName,
            currencySign: toCurrency, // Include the paymentMethod property
          }),
        }
      );
      const razororder = await response.json();

      const options = {
        key: razorkeyid,
        amount: razorGrandTotal * 100,
        currency: toCurrency,
        name: "ProCanes",
        description: "payment",
        image: "https://your-store-logo.png", // URL of your store's logo
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
          currency: toCurrency,
          paymentMethod: paymentMethodName,
          currencySign: toCurrency,
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
  // const [amount, setAmount] = useState("");
  //  const [currency, setCurrency] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // const handleStripePayment = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.post(
  //       `${request}/api/orders/payment`,
  //       {
  //         amount: order.grandTotal,
  //         currency: currency,
  //         token: {
  //           id: "pk_test_51LddZCG74SnLVBhQAzsedUUcKxd33HOpAIThNyxKl2l4mxvCj8uywmQFZHNq5EmiIn6jNrAVGrBqT1tWHprcD3XF00xOSuchsE",
  //           card: {
  //             number: cardNumber,
  //             exp_month: expiry.split("/")[0],
  //             exp_year: expiry.split("/")[1],
  //             cvc: cvc,
  //           },
  //         },
  //         orderId: orderId, // Pass the actual order ID here
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer sk_test_51LddZCG74SnLVBhQgEpJEtwmrZun228Px4rYGTLUZ1xC81NzN2TP2svtDGXT3UPaYcEy8jtfj6X6k5EbzcEROpFu00eKwTYye4`,
  //         },
  //       }
  //     );
  //     console.log(response.data);
  //     setIsLoading(false);
  //     setErrorMessage("");
  //   } catch (error) {
  //     console.error(error);
  //     setIsLoading(false);
  //     setErrorMessage("An error occurred while processing the payment");
  //   }
  // };
  const handleToken = async (token) => {
    try {
      const response = await axios.post(
        `${request}/api/orders/payment`,
        {
          amount: order.grandTotal * 100, // Amount in cents
          currency: toCurrency,
          token: token,
          orderId: orderId, // Pass the actual order ID here
        },
        {
          headers: {
            Authorization: `Bearer sk_test_51LddZCG74SnLVBhQgEpJEtwmrZun228Px4rYGTLUZ1xC81NzN2TP2svtDGXT3UPaYcEy8jtfj6X6k5EbzcEROpFu00eKwTYye4`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      // Handle the response or update your UI accordingly
    } catch (error) {
      console.error(error);
      // Handle the error or display an error message
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
                    <label
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
                    </label>
                    {/* <label
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
                    </label> */}
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
                            checked={openPaypalModal === true}
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
                        openPayStackModal
                          ? "active payment_label"
                          : "payment_label"
                      }
                      htmlFor="stripe"
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
                            id="stripe"
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
                          <div className="stripe-details">
                            {/* <div className="p-inner-form">
                              <div className="form-group">
                                <label htmlFor="card-holder">
                                  Cardholder's Name
                                </label>
                                <div className="payment-input-box">
                                  <input
                                    type="text"
                                    id="name"
                                    disabled
                                    placeholder="Name"
                                  />
                                  <i className="fa fa-user"></i>
                                </div>
                              </div>
                              <div className="form-group">
                                <label htmlFor="card-number">Card Number</label>
                                <div className="payment-input-box">
                                  <input
                                    type="tel"
                                    id="card-number"
                                    name="card-number"
                                    disabled
                                    value={cardNumber}
                                    onChange={(e) =>
                                      setCardNumber(e.target.value)
                                    }
                                    inputMode="numeric"
                                    pattern="[\d ]{10,30}"
                                    // maxLength="16"
                                    placeholder="**** **** **** ****"
                                  />
                                  <i className="fa fa-credit-card"></i>
                                </div>
                              </div>
                              <div className="form-date">
                                <div className="form-group-d">
                                  <label htmlFor="card-date">Valid thru.</label>
                                  <div className="cvc-fa-icon">
                                    <input
                                      type="text"
                                      value={expiry}
                                      disabled
                                      onChange={(e) =>
                                        setExpiry(e.target.value)
                                      }
                                      placeholder="MM/YY"
                                    />
                                  </div>
                                </div>
                                <div className="form-group-d">
                                  <label htmlFor="card-cvv">CVV / CVC*</label>
                                  <div className="cvc-fa-icon">
                                    <input
                                      type="tel"
                                      id="cvv"
                                      disabled
                                      value={cvc}
                                      onChange={(e) => setCvc(e.target.value)}
                                      maxLength="3"
                                      pattern="[0-9]{3}"
                                      placeholder="cvv"
                                    />
                                    <i className="fa fa-lock" id="passcvv"></i>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <span>
                                  * CVV or CVC is the card security code, unique
                                  three digits number on the back of your card
                                  separate from its number
                                </span>
                              </div>
                              {errorMessage && <p>{errorMessage}</p>}
                              <div className="stripe_btn">
                                <button
                                  onClick={handleStripePayment}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Processing..." : "Pay"}
                                </button>
                              </div>
                            </div> */}
                            {/* <StripeCheckout
                              token={handleToken}
                              stripeKey="pk_test_51LddZCG74SnLVBhQAzsedUUcKxd33HOpAIThNyxKl2l4mxvCj8uywmQFZHNq5EmiIn6jNrAVGrBqT1tWHprcD3XF00xOSuchsE"
                              amount={order?.grandTotal * 100} // Amount in cents
                              currency={currency}
                              name="My Store"
                              description="Example Purchase"
                            >
                              <button>Pay with Stripe</button>
                            </StripeCheckout> */}
                          </div>
                        )}
                        {openPaypalModal && (
                          <div className="paypal-details">
                            <div className="paypal-btn">
                              {toCurrency === "USD" ||
                              toCurrency === "EUR" ||
                              toCurrency === "GBP" ? (
                                <PayPalButtons
                                  createOrder={createOrder}
                                  onApprove={onApprove}
                                  onError={onError}
                                ></PayPalButtons>
                              ) : (
                                ""
                              )}
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
                        {openPayTmModal && (
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
                        )}
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
