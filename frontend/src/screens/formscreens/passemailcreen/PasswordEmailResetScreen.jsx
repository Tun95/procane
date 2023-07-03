import React, { useReducer } from "react";
import "../styles/style.scss";

import { Formik, ErrorMessage, Field, Form } from "formik";
import { resetSchema } from "../../../components/schemas/Index";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";

const reducer = (state, action) => {
  switch (action.type) {
    case "SUBMIT_REQUEST":
      return { ...state, loading: true };
    case "SUBMIT_SUCCESS":
      return { ...state, loading: false };
    case "SUBMIT_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};
function PasswordEmailResetScreen() {
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });
  const initialValues = {
    email: "",
  };

  const handleSubmit = async (values, actions) => {
    try {
      dispatch({ type: "SUBMIT_REQUEST" });
      const { data } = await axios.post(`${request}/api/users/password-token`, {
        email: values.email,
      });
      dispatch({ type: "SUBMIT_SUCCESS", payload: data });
      toast.success("Password reset email successfully sent to your email", {
        position: "bottom-center",
      });
    } catch (err) {
      dispatch({ type: "SUBMIT_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
    setTimeout(() => {
      actions.resetForm();
    }, 1000);
  };

  return (
    <div className="form-box">
      <div className="form-box-content">
        <Formik
          initialValues={initialValues}
          validationSchema={resetSchema}
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
                <h2>Password Reset Form</h2>
                <p>Enter email down below to reset password</p>
                <div className="form-group">
                  <label htmlFor="email">Eamil</label>
                  <Field
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.email && touched.email ? "input-error" : ""
                    }
                    id="email"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-btn">
                  <button className="form-submit-btn" disabled={isSubmitting}>
                    Reset Password
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default PasswordEmailResetScreen;
