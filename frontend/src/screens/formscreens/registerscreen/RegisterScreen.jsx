import React, { useContext, useEffect, useReducer, useState } from "react";
import "../styles/style.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, ErrorMessage, Field, Form } from "formik";

import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import { basicSchema } from "../../../components/schemas/Index";
import { Context } from "../../../context/Context";
import axios from "axios";
import { getError } from "../../../components/utilities/util/Utils";
import { toast } from "react-toastify";
import { request } from "../../../base url/BaseUrl";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

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
function RegisterScreen() {
  const navigate = useNavigate();

  const { search } = useLocation();
  const redirectUnUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectUnUrl ? redirectUnUrl : "/";

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  };

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
  //TOGGLE PASSWOD VIEW
  const [typeCom, setTypeCom] = useState("password");
  const [iconCom, setIconCom] = useState(eyeOff);

  const handleComToggle = () => {
    if (typeCom === "password") {
      setIconCom(eye);
      setTypeCom("text");
    } else {
      setIconCom(eyeOff);
      setTypeCom("password");
    }
  };

  //==================================
  //REGISTER AND VERIFICATION HANDLER
  //==================================
  const handleSubmit = async (values, actions) => {
    try {
      const { data } = await axios.post(`${request}/api/users/signup`, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
      toast.success("Sign up successfully", { position: "bottom-center" });
      await axios.post(
        `${request}/api/users/verification-token`,
        {},
        {
          headers: { authorization: `Bearer ${data.token}` },
        }
      );
      toast.success("A Verification email has bent sent to your email inbox", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center", limit: 1 });
    }
    setTimeout(() => {
      actions.resetForm();
    }, 1000);
  };

  //====================
  // REGISTER WITH GOOGLE
  //====================
  const handleGoogleSignUp = async () => {
    try {
      const { data } = await axios.get(`${request}/api/users/auth/google`);
      // Redirect the user to the provided URL for Google sign-up
      window.location.href = data.redirectUrl;
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  //======================
  // REGISTER WITH FACEBOOK
  //======================
  const handleFacebookSignUp = async () => {
    try {
      const { data } = await axios.get(`${request}/api/users/auth/facebook`);
      // Redirect the user to the provided URL for Facebook sign-up
      window.location.href = data.redirectUrl;
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="form-box">
      <div className="form-box-content">
        <Formik
          initialValues={initialValues}
          validationSchema={basicSchema}
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
              <div className="inner-form">
                <h2>Register Now</h2>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <Field
                    name="firstName"
                    type="text"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.firstName && touched.firstName ? "input-error" : ""
                    }
                    id="firstName"
                    placeholder="Enter your first name"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <Field
                    name="lastName"
                    type="text"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.lastName && touched.lastName ? "input-error" : ""
                    }
                    id="lastName"
                    placeholder="Enter your last name"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="error"
                  />
                </div>
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
                <div className="form-group">
                  <label htmlFor="password">Password</label>
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
                <div className="form-group">
                  <label htmlFor="cpassword">Comfirm Password</label>
                  <Field
                    name="passwordConfirmation"
                    type={typeCom}
                    value={values.passwordConfirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.passwordConfirmation &&
                      touched.passwordConfirmation
                        ? "input-error"
                        : ""
                    }
                    id="cpassword"
                    placeholder="Comfirm password"
                  />
                  <span onClick={handleComToggle}>
                    <Icon icon={iconCom} size={20} className="eye-icon" />
                  </span>
                  <ErrorMessage
                    name="passwordConfirmation"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-btn">
                  <button disabled={isSubmitting} className="form-submit-btn">
                    Register
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        <span className="l_flex or">OR</span>
        <div>

          {/* Google sign-up button */}
          <GoogleLogin
            //clientId="408401850346-97mfn7e1q7f698pn7in837hha576nleb.apps.googleusercontent.com"
            onSuccess={handleGoogleSignUp}
            onFailure={(error) => console.log("Google sign-up failed", error)}
            buttonText="Sign up with Google"
          />

          {/* Facebook sign-up button */}
          <FacebookLogin
            appId="6222862251176447"
            callback={handleFacebookSignUp}
            onFailure={(error) => console.log("Facebook sign-up failed", error)}
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                className="facebook-login-button mt"
              >
                Sign up with Facebook
              </button>
            )}
          />
          <div className="form-lower-text">
            <p>Already a member?</p>
            <span>
              <Link to="/login">Login</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterScreen;
