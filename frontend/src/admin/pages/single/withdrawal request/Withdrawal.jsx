import React, { useContext, useEffect } from "react";
import "./styles.scss";
import { useReducer } from "react";
import { Context } from "../../../../context/Context";
import axios from "axios";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import { toast } from "react-toastify";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import { Helmet } from "react-helmet-async";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, withdrawalRequests: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, successUpdate: false };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, successUpdate: true };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPDATE_RESET":
      return { ...state, loadingUpdate: false, successUpdate: false };

    default:
      return state;
  }
};

function Withdrawal() {
  const { state, convertCurrency } = useContext(Context);
  const { userInfo } = state;

  const [
    {
      loading,
      error,
      loadingUpdate,
      successUpdate,
      successDelete,
      withdrawalRequests,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  //============================
  //FETCH ALL WITHDRAWAL REQUEST
  //============================
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(
          `${request}/api/users/withdrawal-requests`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successUpdate || successDelete) {
      dispatch({ type: "UPDATE_RESET" });
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete, successUpdate, userInfo]);

  //==============================
  // SUBMIT APPROVAL/DECLINE
  //==============================
  const submitHandler = async (withdrawalRequest, action) => {
    try {
      const { _id } = withdrawalRequest;
      console.log("Withdrawal Request ID:", _id);
      // Dispatch action to indicate request in progress
      dispatch({ type: "UPDATE_REQUEST" });

      const response = await axios.patch(
        `${request}/api/users/withdraw/${_id}`,
        { action },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      // Show success message based on action
      if (action === "approve") {
        toast.success(response.data.message, {
          position: "bottom-center",
        });
      } else if (action === "decline") {
        toast.error(response.data.message, { position: "bottom-center" });
      }
      // Dispatch success action
      dispatch({ type: "UPDATE_SUCCESS" });
    } catch (err) {
      // Show error message
      toast.error(getError(err), { position: "bottom-center" });
      // Dispatch error action
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  //=====================
  // DELETE WITHDRAWALS
  //=====================
  const deleteHandler = async (withdrawalRequest) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(
        `${request}/api/users/withdrawal-requests/${withdrawalRequest._id}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success("Deleted successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  console.log(withdrawalRequests);
  return (
    <div className="withdrawal">
      <Helmet>
        <title>Withdrawal Requests</title>
      </Helmet>
      <div className="container mt mb">
        <div className="box_shadow">
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <span>
                <h2>Withdrawal Requests</h2>
              </span>
              {withdrawalRequests?.length > 0 ? (
                withdrawalRequests.map((user) => (
                  <div key={user.userId} className="withdrawal-card">
                    <h3>{user.username}</h3>
                    {user.sellerName && <p>Seller: {user.sellerName}</p>}
                    {user.requests.map((request) => (
                      <div key={request._id} className="request-item">
                        <p>
                          Amount:{" "}
                          <span className="price">
                            {convertCurrency(request.amount)}
                          </span>
                        </p>
                        <p>Gateway: {request.gateway}</p>
                        <p>
                          Status:{" "}
                          <small
                            className={
                              request.status === "pending"
                                ? "pending_account"
                                : request.status === "approved"
                                ? "verified_account"
                                : request.status === "declined"
                                ? "unverified_account"
                                : ""
                            }
                          >
                            {request.status}
                          </small>
                        </p>
                        <p>
                          Request Date:{" "}
                          {new Date(request.requestDate).toLocaleString()}
                        </p>
                        {request.approvalDate && (
                          <p>
                            Approval Date:{" "}
                            {new Date(request.approvalDate).toLocaleString()}
                          </p>
                        )}
                        {request.status === "pending" && (
                          <div className="action-buttons">
                            <button
                              className="approve-button"
                              onClick={() => submitHandler(request, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              className="decline-button"
                              onClick={() => submitHandler(request, "decline")}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {request.status !== "pending" && (
                          <button
                            className="delete-button"
                            onClick={() => deleteHandler(request)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="product_not">
                  <span className="product-not">
                    <MessageBox>No withdrawal requests found.</MessageBox>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Withdrawal;
