import React, { useContext } from "react";
import "./styles.scss";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { getError } from "../../utilities/util/Utils";
import { Context } from "../../../context/Context";
import { request } from "../../../base url/BaseUrl";
import EmailIcon from "@mui/icons-material/Email";

const SubscribeSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required*"),
});

function Subscribe() {
  const initialValues = {
    email: "",
  };

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings, userInfo } = state;

  const handleSubmit = async (values, actions) => {
    try {
      const { data } = await axios.post(`${request}/api/message/subscribe`, {
        email: values.email,
      });
      toast.success("You have successfully subscribed to our newsletter", {
        position: "bottom-center",
      });
      actions.resetForm();
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  return (
    <div className="background">
      <div className="box_shadow subscribe_box">
        <div className="container">
          <div className="form_group">
            <Formik
              initialValues={initialValues}
              validationSchema={SubscribeSchema}
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
                <Form
                  action=""
                  onSubmit={handleSubmit}
                  className="d_flex subscribe_box_content"
                >
                  <div className="content">
                    <div
                      className={
                        errors.email && touched.email
                          ? "search-box input-error"
                          : "search-box"
                      }
                    >
                      <EmailIcon
                        className={
                          errors.email && touched.email
                            ? "email_box input-error"
                            : "email_box"
                        }
                      />
                      <Field
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        id="email"
                        placeholder="Enter your email e.g info@example.com"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="error"
                    />
                  </div>
                  <div className="btn">
                    <button type="submit" disabled={isSubmitting}>
                      Subscribe
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <span>
          <small className="text_small">
            Subscribe to our newsletter today for product updates, exclusive
            offers, and design inspiration{" "}
          </small>
        </span>
      </div>
    </div>
  );
}

export default Subscribe;
