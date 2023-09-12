import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Helmet } from "react-helmet-async";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import axios from "axios";
import { request } from "../../base url/BaseUrl";
import { getError } from "../utilities/util/Utils";

const steps = ["Billing Address", "Confirmation", "Payment Method", "Finish"];

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};
function Confirmation(props) {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems, shippingAddress },
  } = state;

  //SETTINGS
  const { express, expressCharges, standardCharges } =
    (settings &&
      settings
        .map((s) => ({
          express: s.express,
          expressCharges: s.expressCharges,
          standardCharges: s.standardCharges,
        }))
        .find((props) => !isNaN(props.expressCharges))) ||
    {};

  console.log(shippingAddress);

  const [tax, setTax] = useState(0);
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const { data } = await axios.get(
          `https://api.apilayer.com/tax_data/tax_rates?country=${shippingAddress.countryCode}`,
          {
            headers: {
              apikey: "mR5BEoNR5z6Mj7vLzCW1UN7rtIeSYGY1", // Replace with your actual API key
            },
          }
        );
        console.log("Response Data:", data);
        const taxRate = data.standard_rate.rate;
        setTax(taxRate);
        console.log("Tax Rate:", taxRate);
      } catch (error) {
        console.log("Error fetching tax rate data:", error);
      }
    };
    fetchTaxRate();
  }, [shippingAddress.countryCode, shippingAddress.zipCode]);

  //===================
  //CALCULATE TAX
  //===================
  // const calculateTax = useCallback(async () => {
  //   try {
  //     const orderData = {
  //       from_country: "US", // Replace with your from_country
  //       from_zip: "07001", // Replace with your from_zip
  //       from_state: "NJ", // Replace with your from_state
  //       from_city: "Avenel", // Replace with your from_city
  //       from_street: "305 W Village Dr", // Replace with your from_street

  //       to_country: shippingAddress.countryCode, // Replace with the country from shippingAddress
  //       to_zip: shippingAddress.zipCode, // Replace with the zipCode from shippingAddress
  //       to_state: shippingAddress.cState, // Replace with the cState from shippingAddress
  //       to_city: shippingAddress.city, // Replace with the city from shippingAddress
  //       to_street: shippingAddress.address, // Replace with the address from shippingAddress

  //       amount: 1006.5, // Replace with your order amount
  //       shipping: 1.5, // Replace with your shipping cost

  //       line_items: [
  //         {
  //           id: "1",
  //           quantity: 1,
  //           product_tax_code: "31000", // Replace with your product tax code
  //           unit_price: 15.0, // Replace with your product unit price
  //           discount: 0, // Replace with your product discount if any
  //         },
  //       ],
  //     };

  //     const response = await axios.post(
  //       `${request}/api/orders/calculate-tax`,
  //       orderData
  //     );

  //     const taxAmount = response.data.taxAmount;

  //     if (taxAmount === 0) {
  //       console.error("Tax calculation returned 0. Check address data.");
  //     } else {
  //       console.log(`TAXJAR: ${taxAmount}`);
  //     }
  //   } catch (error) {
  //     console.error("Error calculating tax:", error);
  //     // Handle errors appropriately (e.g., display an error message)
  //   }
  // }, [shippingAddress]);

  // useEffect(() => {
  //   calculateTax();
  // }, [calculateTax]);

  const itemsPrice = cartItems.reduce(
    (a, c) => a + (c.price - (c.price * c.discount) / 100) * c.quantity,
    0
  );
  const taxPrice = itemsPrice * tax;
  const shippingPrice =
    shippingAddress.shipping === express ? expressCharges : standardCharges;
  const grandTotal = (
    Number(itemsPrice) +
    Number(taxPrice) +
    Number(shippingPrice)
  ).toFixed(0);

  useEffect(() => {
    if (!shippingAddress.address || cartItems.length === 0) {
      navigate("/billing?redirect");
    }
  }, [shippingAddress, navigate, cartItems]);
  const backHandler = () => {
    navigate("/billing");
  };

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });

  //==================
  // PLACE ORDER
  //==================
  const placeOrderHandler = async () => {
    dispatch({ type: "CREATE_REQUEST" });
    if (!userInfo.isAccountVerified) {
      toast.error("Please verify your account to checkout", {
        position: "bottom-center",
      });
    } else {
      // Calculate the total affiliate commission for each affiliator
      const totalAffiliateCommissionPerAffiliator = cartItems.reduce(
        (acc, item) => {
          if (item.affiliateCode !== "") {
            // Check if the affiliateCode is not empty
            // If the affiliateCode exists, add the affiliateCommission to the total
            acc[item.affiliateCode] =
              (acc[item.affiliateCode] || 0) + item.affiliateCommission;
          }
          return acc;
        },
        {}
      );

      try {
        const { data } = await axios.post(
          `${request}/api/orders`,
          {
            orderItems: cartItems,
            affiliatorCommissionMap: totalAffiliateCommissionPerAffiliator, // Pass the total affiliate commission map to the order
            shippingAddress,
            itemsPrice,
            shippingPrice: shippingPrice,
            taxPrice,
            grandTotal,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        ctxDispatch({ type: "CART_CLEAR" });
        dispatch({ type: "CREATE_SUCCESS" });
        localStorage.removeItem("cartItems");
        navigate(`/payment/${data.order._id}`);
      } catch (err) {
        dispatch({ type: "CREATE_FAIL" });
        toast.error(getError(err), { position: "bottom-center" });
      }
    }
  };
  return (
    <>
      <div className="form_container">
        <Helmet>
          <title>Checkout</title>
        </Helmet>
        <div className="mtb form_box_content">
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={1} alternativeLabel>
              {steps?.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <span className="labelProps">{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="confirmtion mtb">
            <div className="confirmation_box">
              <div className="order_summary">
                <h3>Order Item Summary:</h3>
                <TableContainer component={Paper} className="table">
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell className="tableCell">Item</TableCell>
                        <TableCell className="tableCell">Qty</TableCell>
                        <TableCell className="tableCell">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="tableCell">
                            {item.name}
                          </TableCell>
                          <TableCell className="tableCell">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="tableCell tableCellPrice">
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className="delivery_info">
                <h3>Delivery:</h3>
                <div className="content">
                  <h4>Address</h4>
                  <div className="small_text">
                    <p className="address">
                      {shippingAddress.address}, &#160;{shippingAddress.city},
                      &#160;
                      {shippingAddress.zipCode}, &#160;{shippingAddress.cState},
                      &#160;
                      {shippingAddress.country}
                    </p>
                  </div>

                  <h4>Delivery options</h4>
                  <div className="small_text">
                    <p className="d-stand">{shippingAddress.shipping}</p>
                  </div>
                </div>
                <div className="table_content">
                  <h3>Summary:</h3>
                  <TableContainer component={Paper} className="table">
                    <Table aria-label="simple table">
                      <TableBody>
                        <TableRow>
                          <TableCell className="tableCell tableCellPrice a_flex">
                            <h4>TAXPRICE</h4>
                            <span>{tax || 0}%</span>
                          </TableCell>
                          <TableCell className="tableCell a_flex">
                            <h4>Shipping</h4>{" "}
                            <span>
                              {shippingAddress.shipping === express ? (
                                <div className="price">
                                  {convertCurrency(expressCharges) || 0}
                                </div>
                              ) : (
                                <span>
                                  {standardCharges === "" ? (
                                    "free"
                                  ) : (
                                    <span className="price">
                                      {convertCurrency(standardCharges) || 0}
                                    </span>
                                  )}
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="tableCell tableCellPrice a_flex">
                            <h4>Subtotal</h4>
                            <span>{convertCurrency(itemsPrice) || 0}</span>
                          </TableCell>
                          <TableCell className="tableCell tableCellPrice a_flex">
                            <h4>Grandtotal</h4>
                            <span>{convertCurrency(grandTotal) || 0}</span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>
            <div className="submit_btn">
              <button className="stepper_back_btn" onClick={backHandler}>
                BACK
              </button>
              <button className="stepper_next_btn" onClick={placeOrderHandler}>
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Confirmation;
