import React, { useContext, useEffect } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import finish from "../../assets/finish.png";
import "./style.scss";

const steps = ["Billing Address", "Confirmation", "Payment Method", "Finish"];

function Finish() {
  const navigate = useNavigate();
  const { state } = useContext(Context);
  const {
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/billing?redirect");
    }
  }, [shippingAddress, navigate]);
  const handleBack = () => {
    navigate("/store");
  };
  return (
    <>
      <div className="form_container">
        <Helmet>
          <title>Checkout</title>
        </Helmet>
        <div className="mtb form_box_content">
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={4} alternativeLabel>
              {steps?.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <span className="labelProps">{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="finish_detail">
            <div className="finish-sections">
              <div className="f-sections">
                <div className="img">
                  <img src={finish} alt="" />
                </div>
                <div className="details">
                  <h1>Success!</h1>
                  <span>
                    Your items will be shipped shortly, you will get
                    email with details.
                  </span>
                </div>
                <div className="finish-btn">
                  <button onClick={handleBack}>Back to Shop</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Finish;
