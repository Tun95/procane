import { Formik, ErrorMessage, Field, Form } from "formik";
import React, { useContext, useReducer, useState } from "react";

import "../styles/style.scss";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import { newPassSchema } from "../../../components/schemas/Index";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";
import { request } from "../../../base url/BaseUrl";

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
function PasswordResetFormScreen() {
  const params = useParams();
  const { token, id: userId } = params;

  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });
  //TOGGLE PASSWOD VIEW
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  const initialValues = {
    password: "",
  };

  const handleSubmit = async (values, actions) => {
    try {
      dispatch({ type: "SUBMIT_REQUEST" });
      const { data } = await axios.put(`${request}/api/users/${userId}/reset-password`, {
        password: values.password,
        token,
      });
      dispatch({ type: "SUBMIT_SUCCESS", payload: data });
      toast.success(
        "Password reset  successfully, you will be redirected to login screen in 3 seconds",
        {
          position: "bottom-center",
        }
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      dispatch({ type: "SUBMIT_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
    setTimeout(() => {
      actions.resetForm();
    }, 2000);
  };
  return (
    <div className="form-box">
      <div className="form-box-content">
        <Formik
          initialValues={initialValues}
          validationSchema={newPassSchema}
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
                <h2>New Password</h2>
                <p>Enter new password down below</p>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <Field
                    name="password"
                    type={type}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.password && touched.password ? "input-error" : ""
                    }
                    id="password"
                    placeholder="Enter your password"
                  />
                  <span onClick={handleToggle}>
                    <Icon icon={icon} size={20} className="eye-icon" />
                  </span>
                  <ErrorMessage
                    name="password"
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

export default PasswordResetFormScreen;
