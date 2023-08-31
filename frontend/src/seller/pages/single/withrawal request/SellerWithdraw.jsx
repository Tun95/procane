import React, { useContext, useEffect, useReducer } from "react";
import "./styles.scss";
import { Formik, Form, Field, ErrorMessage } from "formik"; // Import Formik components
import * as Yup from "yup"; // Import Yup for form validation
import axios from "axios";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../../components/utilities/util/Utils";
import me from "../../../../assets/me.png";
import Widget from "../../../../admin/components/widget/Widget";
import { Helmet } from "react-helmet-async";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "POST_REQUEST":
      return { ...state, loadingPost: true };
    case "POST_SUCCESS":
      return { ...state, loadingPost: false };
    case "POST_FAIL":
      return { ...state, loadingPost: false };

    default:
      return state;
  }
};

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .min(1, "Amount must be greater than 0")
    .required("Amount is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  gateway: Yup.string().required("Gateway is required"),
});

function SellerWithdraw() {
  const { state, convertCurrency } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, loadingPost, error, user }, dispatch] = useReducer(
    reducer,
    {
      loading: false,
      loadingPost: false,
      error: "",
    }
  );

  //========
  //FETCHING
  //========
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/users/${userInfo._id}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  //==============
  //SUBMIT HANDLER
  //==============
  const handleSubmit = async (values, actions) => {
    try {
      dispatch({ type: "POST_REQUEST" });

      // Send the form data to the backend
      const response = await axios.post(
        `${request}/api/users/withdraw`,
        values,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      toast.success(response.data.message, {
        position: "bottom-center",
      });
      dispatch({ type: "POST_SUCCESS" });
      setTimeout(() => {
        actions.resetForm();
      }, 1000);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "POST_FAIL" });
    }
  };

  //AVAILABLE BALANCE
  const balance = user?.user?.availableBalance
    ? user?.user?.availableBalance?.toFixed(0)
    : 0;
  const SellersBalance = convertCurrency(balance);

  return (
    <div className="seller_withdrawal">
      <Helmet>
        <title>Withdraw</title>
      </Helmet>
      <div className="container mt mb">
        <div className="box_shadow d_flex">
          <div className="product ">
            <div className="left">
              <h1 className="title">Information</h1>
              <div className="item">
                <img
                  src={user?.user?.image ? user?.user?.image : me}
                  alt=""
                  className="itemImg"
                />
                <div className="details">
                  <h1 className="itemTitle">
                    {user?.user?.firstName} {user?.user?.lastName}
                  </h1>
                  <div className="detailItem">
                    <span className="itemKey">Email:</span>
                    <span className="itemValue">{user?.user?.email}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Phone:</span>
                    <span className="itemValue">{user?.user?.phone}</span>
                  </div>{" "}
                </div>
              </div>
              {user?.user?.isSeller ? (
                <div className="userInfo_widget">
                  <Widget SellersBalance={SellersBalance} type="seller" />
                </div>
              ) : null}
            </div>
          </div>
          <div className="product">
            <h1 className="title">Request withdraw</h1>
            <Formik
              initialValues={{
                amount: 0,
                email: "",
                gateway: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form>
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <Field type="number" id="amount" name="amount" />
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    // className={email && email ? "input-error" : ""}
                    placeholder="Enter PayPal Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gateway">Gateway</label>
                  <Field
                    as="select"
                    id="gateway"
                    name="gateway"
                    className="gateway"
                  >
                    <option value="">Select Gateway</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Stripe">Stripe</option>
                  </Field>
                  <ErrorMessage
                    name="gateway"
                    component="div"
                    className="error"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingPost}
                  className="submit-button"
                >
                  {loadingPost ? "Submitting..." : "Submit"}
                </button>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerWithdraw;
