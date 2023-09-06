import React, { useContext, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Formik, ErrorMessage, Field, Form } from "formik";
import { sellerSchema } from "../../../components/schemas/Index";
import "./styles.scss";
import { Link, useParams } from "react-router-dom";
import { Context } from "../../../context/Context";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import LoadingBox from "../../../components/utilities/message loading/LoadingBox";

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
function VendorScreen() {
  const params = useParams();
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, user }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const initialValues = {
    sellerName: "",
    storeAddress: "",
    sellerDescription: "",
    status: false,
  };

  //==============
  // APPLY
  //==============
  const handleSubmit = async (values, actions) => {
    dispatch({ type: "CREATE_REQUEST" });

    try {
      if (!userInfo.isAccountVerified) {
        toast.error("You need to be a verified user to apply as a merchant", {
          position: "bottom-center",
        });
      } else if (userInfo.isSeller) {
        toast.error("Your account has already been approved as a vendor", {
          position: "bottom-center",
        });
      } else {
        const { data } = await axios.post(
          `${request}/api/apply`,
          {
            sellerName: values.sellerName,
            storeAddress: values.storeAddress,
            sellerDescription: values.sellerDescription,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "CREATE_SUCCESS", payload: data });
        toast.success("Application sent successfully", {
          position: "bottom-center",
        });
        setTimeout(() => {
          actions.resetForm();
        }, 1000);
      }
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      if (err.response && err.response.status === 401) {
        toast.error("Unauthorized. Please log in.", {
          position: "bottom-center",
        });
      } else {
        toast.error(getError(err), { position: "bottom-center" });
      }
    }
  };

  return (
    <div className="form_container">
      <Helmet>
        <title>Vendor Application</title>
      </Helmet>
      <div className="form_box_content">
        <Formik
          initialValues={initialValues}
          validationSchema={sellerSchema}
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
                <h2 className="form_header">Vendor Application Form</h2>
                <div className="form-group">
                  <label htmlFor="sellerName">Merchant or store name:</label>
                  <Field
                    name="sellerName"
                    type="sellerName"
                    value={values.sellerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.sellerName && touched.sellerName
                        ? "input-error"
                        : ""
                    }
                    id="sellerName"
                    placeholder="Enter your seller name"
                  />
                  <ErrorMessage
                    name="sellerName"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storeAddress">Store Address:</label>
                  <Field
                    name="storeAddress"
                    type="storeAddress"
                    value={values.storeAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.storeAddress && touched.storeAddress
                        ? "input-error"
                        : ""
                    }
                    id="storeAddress"
                    placeholder="Enter your address"
                  />
                  <ErrorMessage
                    name="storeAddress"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sellerDescription">About:</label>
                  <Field
                    as="textarea"
                    id="sellerDescription"
                    name="sellerDescription"
                    type="sellerDescription"
                    value={values.sellerDescription}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.sellerDescription && touched.sellerDescription
                        ? "textarea input-error"
                        : "textarea"
                    }
                    placeholder="About your products and store..."
                  />
                  <ErrorMessage
                    name="sellerDescription"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="">
                  <span className="check_box">
                    <input
                      type="checkbox"
                      checked={values.status}
                      id="status"
                      className="flashdeal"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <label htmlFor="status">
                      I agree to the{" "}
                      <Link to="/terms-and-conditons">
                        terms and conditions
                      </Link>
                    </label>
                  </span>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-btn">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="form_submit_btn"
                  >
                    {isSubmitting ? (
                      <LoadingBox className="loading_submit" />
                    ) : (
                      <React.Fragment>Submit</React.Fragment>
                    )}
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

export default VendorScreen;
