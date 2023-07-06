import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import { useNavigate } from "react-router-dom";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import "./style.scss";
import { toast } from "react-toastify";
import { Context } from "../../context/Context";

const steps = ["Billing Address", "Confirmation", "Payment Method", "Finish"];

function ShippingAddress() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const {
    userInfo,
    settings,
    cart: { cartItems, shippingAddress },
  } = state;

  const [firstName, setFirstName] = useState(shippingAddress.firstName || "");
  const [lastName, setLastName] = useState(shippingAddress.lastName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [phone, setPhone] = useState(shippingAddress.phone || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [cState, setcState] = useState(shippingAddress.cState || "");
  const [country, setCountry] = useState(shippingAddress.country || "");
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || "");
  const [shipping, setShipping] = useState("");

  useEffect(() => {
    if (!userInfo || cartItems.length === 0) {
      navigate("/login?redirect=/store");
    }
  }, [navigate, userInfo, cartItems]);

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
      !shipping
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
          shipping,
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
          shipping,
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
    if (!shipping) {
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
          <form className="checkout_form  mtb" onSubmit={submitHandler}>
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
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Your Phone Number"
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
                <CountryDropdown
                  value={country}
                  onChange={(val) => setCountry(val)}
                  className="select_styles"
                />
              </div>
            </div>
            <div className="delivery">
              <h2>Delivery options*</h2>
              {settings?.map((s, index) => (
                <div key={index} className="delivery-container c_flex product">
                  <span className="a_flex">
                    <input
                      type="radio"
                      id="standard"
                      className="dev_input"
                      name="shipping"
                      value={s.standard}
                      onChange={(e) => setShipping(e.target.value)}
                    />
                    <label htmlFor="standard">
                      <span>
                        <div className="label">{s.standard}</div>
                      </span>
                    </label>
                  </span>
                  <span className="a_flex">
                    <input
                      type="radio"
                      className="dev_input"
                      id="express"
                      value={s.express}
                      name="shipping"
                      onChange={(e) => setShipping(e.target.value)}
                    />
                    <label htmlFor="express">
                      <span>
                        <div className="label">{s.express}</div>
                      </span>
                    </label>
                  </span>
                </div>
              ))}
            </div>
            <div className="submit_btn">
              <button className="stepper_back_btn" onClick={backHandler}>
                BACK
              </button>
              <button className="stepper_next_btn">NEXT</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ShippingAddress;
