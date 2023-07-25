import React, { useContext, useReducer } from "react";
import { Formik, ErrorMessage, Field, Form } from "formik";

import { Helmet } from "react-helmet-async";
import "../styles/style.scss";
import { contactSchema } from "../../../components/schemas/Index";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";
import { request } from "../../../base url/BaseUrl";
import { Context } from "../../../context/Context";

const reducer = (state, action) => {
  switch (action.type) {
    case "POST_REQUEST":
      return { ...state, loading: true };
    case "POST_SUCCESS":
      return { ...state, loading: false };
    case "POST_FAIL":
      return { ...state, loading: false };

    default:
      return state;
  }
};
function ContactScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings } = state;
  const { webname, messenger, whatsapp } =
    (settings &&
      settings
        .map((s) => ({
          webname: s.webname,
          messenger: s.messenger,
          whatsapp: s.whatsapp,
        }))
        .find(() => true)) ||
    {};

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const initialValues = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };

  const handleSubmit = async (values, actions) => {
    try {
      dispatch({ type: "POST_REQUEST" });
      const { data } = axios.post(`${request}/api/message`, {
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      });
      dispatch({ type: "POST_SUCCESS", payload: data });
      toast.success("Email sent successfully", { position: "bottom-center" });
    } catch (err) {
      dispatch({ type: "POST_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
    setTimeout(() => {
      actions.resetForm();
    }, 1000);
  };

  return (
    <div className="form_container">
      <Helmet>
        <title>Contact us</title>
      </Helmet>
      <div className="form_box_content">
        <Formik
          initialValues={initialValues}
          validationSchema={contactSchema}
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
                <h2 className="form_header">Contact Us</h2>

                <div className="featured_box">
                  <div className="featured">
                    <div className="icon">
                      <i className="fa-brands fa-facebook-messenger messenger"></i>
                    </div>
                    <div className="content">
                      <span className="name">
                        <label htmlFor="name">Store:</label>
                        <div className="">{webname} store</div>
                      </span>
                      <div className="via_contact">
                        <label htmlFor="via">Via Messenger:</label>
                        <div className="contact_btn_social">
                          <a
                            className="messenger"
                            href={`https://m.me/${messenger}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa-brands fa-facebook-messenger"></i>{" "}
                            Messenger
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="featured">
                    <div className="icon">
                      <i className="fa-brands fa-whatsapp whatsapp"></i>
                    </div>
                    <div className="content">
                      <span className="name">
                        <label htmlFor="name">Store:</label>
                        <div className="">{webname} Store</div>
                      </span>
                      <div className="via_contact">
                        <label htmlFor="via">Via Whatsapp:</label>
                        <div className="contact_btn_social">
                          <a
                            className="whatsapp"
                            href={`https://wa.me/${whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa-brands fa-whatsapp"></i> Whatsapp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contact_form_group">
                  <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <Field
                      name="name"
                      type="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        errors.name && touched.name ? "input-error" : ""
                      }
                      id="name"
                      placeholder="Enter your name"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="error"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Eamil:</label>
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
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Title:</label>
                  <Field
                    name="subject"
                    type="subject"
                    value={values.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.subject && touched.subject ? "input-error" : ""
                    }
                    id="subject"
                    placeholder="Enter your subject"
                  />
                  <ErrorMessage
                    name="subject"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <Field
                    as="textarea"
                    id="message"
                    name="message"
                    type="message"
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.message && touched.message
                        ? "textarea input-error"
                        : "textarea"
                    }
                    placeholder="Enter your message..."
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="error"
                  />
                </div>
                <div className="form-btn">
                  <button disabled={isSubmitting} className="form_submit_btn">
                    Send
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

export default ContactScreen;
