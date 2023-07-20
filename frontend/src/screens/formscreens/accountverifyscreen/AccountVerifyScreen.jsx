import { Formik, ErrorMessage, Field, Form } from "formik";
import React from "react";
import { otpSchema } from "../../../components/schemas/Index";

import "../styles/style.scss";
import { Helmet } from "react-helmet-async";

function AccountVerifyScreen() {
  const initialValues = {
    otp: "",
  };

  const handleSubmit = async (values, actions) => {
    setTimeout(() => {
      actions.resetForm();
    }, 1000);
  };

  return (
    <div className="form-box">
      <Helmet>
        <title>Account Verification</title>
      </Helmet>
      <div className="form-box-content">
        <Formik
          initialValues={initialValues}
          validationSchema={otpSchema}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            touched,
            handleSubmit,
            handleChange,
            handleBlur,
            isSubmitting,
            values,
          }) => (
            <Form action="" onSubmit={handleSubmit}>
              <div className="inner-form inner-form-small">
                <h2>Account Verification</h2>
                <p>Enter OTP sent to your email down below</p>
                <div className="form-group">
                  <label htmlFor="otp">OTP Token</label>
                  <Field
                    name="otp"
                    type="otp"
                    value={values.otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.otp && touched.otp ? "input-error" : ""}
                    id="otp"
                    placeholder="Enter your otp"
                  />
                  <ErrorMessage name="otp" component="div" className="error" />
                </div>
                <div className="form-btn">
                  <button className="form-submit-btn">Verify Now</button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AccountVerifyScreen;
