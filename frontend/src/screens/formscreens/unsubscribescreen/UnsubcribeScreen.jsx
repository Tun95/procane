import React, { useContext, useReducer } from "react";
import DoneIcon from "@mui/icons-material/Done";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";
import { Context } from "../../../context/Context";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../../../components/utilities/message loading/LoadingBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "UNSUBSCRIBE_REQUEST":
      return { ...state, loading: true };
    case "UNSUBSCRIBE_SUCCESS":
      return { ...state, loading: false };
    case "UNSUBSCRIBE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};
function UnSubscribeScreen() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    order: {},
    error: "",
  });

  //===================
  //Unsubscribe Handler
  //===================
  const UnsubscribeHandler = async () => {
    try {
      dispatch({ type: "UNSUBSCRIBE_REQUEST" });

      // Replace 'userEmail@example.com' with the actual email address
      const userEmail = userInfo.email;

      const { data } = await axios.post(`${request}/api/message/unsubscribe`, {
        email: userEmail,
      });

      dispatch({ type: "UNSUBSCRIBE_SUCCESS", payload: data.message });
      // Display a success toast message
      toast.success(data.message, { position: "bottom-center" });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      dispatch({ type: "UNSUBSCRIBE_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };
  return (
    <div className="form-box">
      <div className="form-box-content">
        <div className="inner-form inner-form-small">
          <div className="form-icon-done">
            <span className="form-icon-span">
              <DoneIcon className="form-icon" />
            </span>
          </div>
          <h2>Unsubscribe Now</h2>
          <p>
            Proceeding with your request to unsubscribe from our newsletter. We
            sincerely appreciate your past engagement and support. Should you
            choose to reconnect with us in the future, you're always welcome
            back. Thank you for staying connected.
          </p>
          <div className="form-btn">
            <button
              className="form-submit-btn"
              onClick={UnsubscribeHandler}
              disabled={loading} // Disable the button while loading
            >
              {loading ? <LoadingBox /> : "Unsubscribe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnSubscribeScreen;
