import React, { useState } from "react";
import { request } from "../../../base url/BaseUrl";
import "./styles.scss";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import OrderInfo from "./OrderInfo";
import { Helmet } from "react-helmet-async";

function Track() {
  //================
  // CREATE SHIPMENT
  //================
  async function createShipment(addressFrom, addressTo, parcels) {
    try {
      const response = await fetch(`${request}/api/orders/shipments"`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address_from: addressFrom,
          address_to: addressTo,
          parcels: parcels,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.shipment;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create shipment");
    }
  }

  //================
  // TRACK SHIPMENT
  //================
  // const trackShipment = async (shipmentId) => {
  //   try {
  //     const response = await fetch(
  //       `${request}/api/orders/shipments/${shipmentId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const result = await response.json();
  //       const shipmentId = JSON.stringify(result.shipment.object_id);
  //       const shipmentData = JSON.stringify(result.shipment); // Convert shipment object to a string
  //       localStorage.setItem("shipmentData", shipmentData);
  //       toast.success(`${shipmentId} Shipment retrieved successfully`, {
  //         position: "bottom-center",
  //       });
  //       return result.shipment;
  //     } else {
  //       const error = await response.json();
  //       toast.error(error.message, {
  //         position: "bottom-center",
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error, {
  //       position: "bottom-center",
  //     });
  //   }
  // };

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    trackingId: Yup.string().required("Tracking id is required"),
  });

  const initialValues = {
    trackingId: "",
  };
  //=======================
  // Handle form submission
  //=======================
  const [orderData, setOrderData] = useState();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch(
        `${request}/api/orders/track?trackingId=${values.trackingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Set the fetched order data in the state
        setOrderData(data.order);
      } else {
        const errorData = await response.json();
        // Handle error response
        setErrors({ trackingId: errorData.message });
      }
    } catch (error) {
      console.log(error);
      setErrors({ trackingId: "Server error" });
    }
    setSubmitting(false);
  };

  // const handleSubmit = (values, { setSubmitting }) => {
  //   const { trackingNumber } = values;
  //   setSubmitting(true); // Set isSubmitting to true

  //   trackShipment(trackingNumber)
  //     .then((shipment) => {
  //       // Handle tracked shipment
  //       console.log("Tracked Shipment:", shipment);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     })
  //     .finally(() => {
  //       setSubmitting(false); // Set isSubmitting back to false after the request completes
  //     });
  // };
  console.log(orderData);

  return (
    <>
      <Helmet>
        <title>Track Order</title>
      </Helmet>
      <div className="shipment light_shadow">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            touched,
            handleSubmit,
            handleChange,
            handleBlur,
            values,
          }) => (
            <Form
              action=""
              onSubmit={handleSubmit}
              className="form-box-content p_flex"
            >
              <span className="table light_shadow">
                <span className="table_header">
                  <h3>Enter the Consignment No.</h3>
                </span>
                <div className="table_body">
                  <div className="table_rows table_grid">
                    <div className="table_data a_flex">
                      <Field
                        type="text"
                        name="trackingId"
                        value={values.trackingId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter Tracking Number"
                        className={
                          errors.trackingId && touched.trackingId
                            ? "input-error"
                            : ""
                        }
                      />
                      <div className="table_data table_btn">
                        <button type="submit">Track Result</button>
                      </div>{" "}
                    </div>
                    <ErrorMessage
                      name="trackingId"
                      component="div"
                      className="error"
                    />
                  </div>
                  <div className="table_rows ">
                    <div className="table_data">
                      <strong>Ex: R49464OB2RM5NV8HE</strong>
                    </div>
                  </div>
                </div>
              </span>
            </Form>
          )}
        </Formik>
        <div className="info_shipment mt">
          <OrderInfo orderInfo={orderData} />
        </div>
      </div>
    </>
  );
}

export default Track;
