import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import countryLookup from "country-code-lookup";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import { useNavigate } from "react-router-dom";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import "./style.scss";
import { toast } from "react-toastify";
import { Context } from "../../context/Context";
import PhoneInput from "react-phone-number-input";
import expressImg from "../../assets/express.png";
import standardImg from "../../assets/standard.png";

const steps = ["Billing Address", "Confirmation", "Payment Method", "Finish"];

function ShippingAddress() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems, shippingAddress },
  } = state;
  const { standard, express, expressCharges, standardCharges } =
    (settings &&
      settings
        .map((s) => ({
          standard: s.standard,
          express: s.express,
          expressCharges: s.expressCharges,
          standardCharges: s.standardCharges,
        }))
        .find((props) => !isNaN(props.expressCharges))) ||
    {};

  const [firstName, setFirstName] = useState(shippingAddress.firstName || "");
  const [lastName, setLastName] = useState(shippingAddress.lastName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [phone, setPhone] = useState(shippingAddress.phone || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [cState, setcState] = useState(shippingAddress.cState || "");
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || "");
  const [countryCode, setCountryCode] = useState(
    shippingAddress.countryCode || ""
  );

  let standardShipping = standard;
  let expressShipping = express;
  //SHIPPING METHOD
  const [shippingMethod, setshippingMethod] = useState();
  console.log(shippingMethod);

  //==============
  //STANDARD MODAL
  //==============
  const [openStandardModal, is0penStandardModal] = useState(false);
  const closeStandardModal = () => {
    is0penStandardModal(false);
    document.body.style.overflow = "unset";
  };
  const showStandardModal = () => {
    is0penStandardModal(true);
  };
  const StandardModal = () => {
    closeExpressModal();
    showStandardModal();
  };

  //==============
  //EXPRESS MODAL
  //==============
  const [openExpressModal, is0penExpressModal] = useState(false);
  const closeExpressModal = () => {
    is0penExpressModal(false);
    document.body.style.overflow = "unset";
  };
  const showExpressModal = () => {
    is0penExpressModal(true);
  };

  const ExpressModal = () => {
    showExpressModal();
    closeStandardModal();
  };

  useEffect(() => {
    if (!userInfo || cartItems.length === 0) {
      navigate("/login?redirect=/store");
    }
  }, [navigate, userInfo, cartItems]);

  const handleCountryChange = (val) => {
    setCountry(val);
    const countryData = countryLookup.byCountry(val);
    if (countryData) {
      setCountryCode(countryData.iso2);
    }
  };
  console.log(countryCode);

  const submitHandler = (e) => {
    e.preventDefault();
    if (
      !firstName ||
      !lastName ||
      !address ||
      !phone ||
      !city ||
      !cState ||
      !country ||
      !zipCode ||
      !shippingMethod
    ) {
      displayToastError();
    } else {
      ctxDispatch({
        type: "SAVE_SHIPPING_ADDRESS",
        payload: {
          firstName,
          lastName,
          address,
          phone,
          city,
          cState,
          country,
          zipCode,
          shipping: shippingMethod,
          countryCode,
        },
      });
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify({
          firstName,
          lastName,
          address,
          phone,
          city,
          cState,
          country,
          zipCode,
          shipping: shippingMethod,
          countryCode,
        })
      );
      navigate("/confirmation?redirect");
    }
  };

  const displayToastError = () => {
    if (!firstName) {
      toast.error("Please enter your first name", {
        position: "bottom-center",
      });
    }
    if (!lastName) {
      toast.error("Please enter your last name", {
        position: "bottom-center",
      });
    }
    if (!address) {
      toast.error("Please enter your address", {
        position: "bottom-center",
      });
    }
    if (!phone) {
      toast.error("Please enter your phone number", {
        position: "bottom-center",
      });
    }
    if (!city) {
      toast.error("Please enter your city", {
        position: "bottom-center",
      });
    }
    if (!cState) {
      toast.error("Please enter your state", {
        position: "bottom-center",
      });
    }
    if (!country) {
      toast.error("Please enter your country", {
        position: "bottom-center",
      });
    }
    if (!zipCode) {
      toast.error("Please enter your zip code", {
        position: "bottom-center",
      });
    }
    if (!shippingMethod) {
      toast.error("Please select a shipping method", {
        position: "bottom-center",
      });
    }
  };

  const backHandler = () => {
    navigate("/store");
  };

  return (
    <>
      <div className="form_container ">
        <Helmet>
          <title>Checkout</title>
        </Helmet>
        <div className="mtb form_box_content billing">
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={0} alternativeLabel>
              {steps?.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <span className="labelProps">{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <form
            action=""
            className="checkout_form  mtb"
            onSubmit={submitHandler}
          >
            <div className="d_grid inner_form">
              <div className="form-group">
                <label htmlFor="firstName">First Name*:</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter Your First Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name*:</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Your Last Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Your Address"
                  id="address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  label="City"
                  placeholder="Enter Your City"
                />
              </div>
              <span className="form-group">
                <label htmlFor="cstate">State:</label>
                <RegionDropdown
                  country={country}
                  value={cState}
                  onChange={(val) => setcState(val)}
                  className="select_styles"
                  // onChange={(val) => setcstate(val)}
                />
              </span>
              <div className="form-group">
                <label htmlFor="zip">Zip Code:</label>
                <input
                  type="text"
                  id="zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter Your zipcode"
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country:</label>
                {/* <CountryDropdown
                  value={country}
                  onChange={(val) => setCountry(val)}
                  className="select_styles"
                /> */}
                <CountryDropdown
                  value={country}
                  onChange={handleCountryChange}
                  className="select_styles"
                />
              </div>
            </div>
            <div className="delivery light_shadow">
              <h2>Delivery options*</h2>
              <div className=" d_grid mtb">
                <label
                  className={
                    openStandardModal ? "active payment_label" : "payment_label"
                  }
                  htmlFor="standardShipping"
                  onClick={StandardModal}
                >
                  <div className="label-svg">
                    <div className="svg">
                      <img src={standardImg} alt="" />
                    </div>
                    <span className="a_flex input_text">
                      <input
                        type="radio"
                        name="standardShipping"
                        id="standardShipping"
                        value={standardShipping}
                        onChange={(e) => setshippingMethod(e.target.value)}
                      />
                      <span>
                        <small>{standard}</small>
                      </span>
                      <span>
                        <small>Fee: {convertCurrency(standardCharges)}</small>
                      </span>
                    </span>
                  </div>
                </label>
                <label
                  className={
                    openExpressModal
                      ? "active payment_label "
                      : "payment_label "
                  }
                  htmlFor="expressShipping"
                  onClick={ExpressModal}
                >
                  <div className="label-svg">
                    <div className="svg">
                      <img src={expressImg} alt="" />
                    </div>

                    <span className="a_flex input_text">
                      <input
                        type="radio"
                        name="expressShipping"
                        id="expressShipping"
                        value={expressShipping}
                        onChange={(e) => setshippingMethod(e.target.value)}
                      />
                      <span>
                        <small>{express}</small>
                      </span>

                      <span>
                        <small>Fee: {convertCurrency(expressCharges)}</small>
                      </span>
                    </span>
                  </div>
                </label>
              </div>
              {/* <div className="delivery-container c_flex product">
                <span className="a_flex">
                  <input
                    type="radio"
                    id="standard"
                    className="dev_input"
                    name="shipping"
                    value={standard}
                    onChange={(e) => setShipping(e.target.value)}
                  />
                  <label htmlFor="standard">
                    <span>
                      <div className="label">{standard}</div>
                    </span>
                  </label>
                </span>
                <span className="a_flex">
                  <input
                    type="radio"
                    className="dev_input"
                    id="express"
                    value={express}
                    name="shipping"
                    onChange={(e) => setShipping(e.target.value)}
                  />
                  <label htmlFor="express">
                    <span>
                      <div className="label">{express}</div>
                    </span>
                  </label>
                </span>
              </div> */}
            </div>
            <div className="submit_btn">
              <button className="stepper_back_btn" onClick={backHandler}>
                BACK
              </button>
              <button type="submit" className="stepper_next_btn">
                NEXT
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ShippingAddress;
