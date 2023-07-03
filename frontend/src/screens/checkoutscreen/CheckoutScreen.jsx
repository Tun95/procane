import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Stepper, Step, StepLabel, Button, Typography } from "@mui/material";

// Step 1 validation schema
const step1Schema = Yup.object({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
});

// Step 2 validation schema
const step2Schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
});

// Step 3 validation schema
const step3Schema = Yup.object({
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
});

// Step 4 validation schema
const step4Schema = Yup.object({
  cardNumber: Yup.string().required("Card Number is required"),
  cardMonth: Yup.string().required("Card Month is required"),
  cardYear: Yup.string().required("Card Year is required"),
});

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  cardNumber: "",
  cardMonth: "",
  cardYear: "",
};

const validationSchemas = [step1Schema, step2Schema, step3Schema, step4Schema];

const steps = [
  { label: "Step 1", validationSchema: validationSchemas[0] },
  { label: "Step 2", validationSchema: validationSchemas[1] },
  { label: "Step 3", validationSchema: validationSchemas[2] },
  { label: "Step 4", validationSchema: validationSchemas[3] },
];

const CheckoutScreen = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values, actions) => {
    if (activeStep === steps.length - 1) {
      // Handle form submission
      console.log(values);
    } else {
      actions.setTouched({});
      actions.setSubmitting(false);
      handleNext();
    }
  };

  return (
    <div className="container">
      <Formik
        initialValues={initialValues}
        validationSchema={steps[activeStep].validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stepper activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === steps.length ? (
              <Typography variant="h5" align="center">
                Thank You
              </Typography>
            ) : (
              <>
                {activeStep === 0 && (
                  <>
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" />

                    <label htmlFor="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" />
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" />

                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input type="text" id="phoneNumber" name="phoneNumber" />
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    <label htmlFor="address">Address:</label>
                    <input type="text" id="address" name="address" />

                    <label htmlFor="city">City:</label>
                    <input type="text" id="city" name="city" />
                  </>
                )}

                {activeStep === 3 && (
                  <>
                    <label htmlFor="cardNumber">Card Number:</label>
                    <input type="text" id="cardNumber" name="cardNumber" />

                    <label htmlFor="cardMonth">Card Month:</label>
                    <input type="text" id="cardMonth" name="cardMonth" />

                    <label htmlFor="cardYear">Card Year:</label>
                    <input type="text" id="cardYear" name="cardYear" />
                  </>
                )}

                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    type="button"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {activeStep === steps.length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CheckoutScreen;
