import React, { useContext, useReducer } from "react";
import DoneIcon from "@mui/icons-material/Done";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Context } from "../../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../../../components/utilities/util/Utils";
import { request } from "../../../base url/BaseUrl";

const reducer = (state, action) => {
  switch (action.type) {
    case "VERIFY_REQUEST":
      return { ...state, loading: true };
    case "VERIFY_SUCCESS":
      return { ...state, loading: false };
    case "VERIFY_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};
function VerifySuccessScreen() {
  const params = useParams();
  const { token, id: userId } = params;

  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectUnUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectUnUrl ? redirectUnUrl : "/login";

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });

  //===============
  //Verify Account
  //===============
  const verificationHandler = async () => {
    try {
      const { data } = await axios.put(
        `${request}/api/users/verify-account/${userId}`,
        { token },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "VERIFY_SUCCESS", payload: data.token });
    } catch (err) {
      dispatch({ type: "VERIFY_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  //===============
  //SIGN OUT
  //===============
  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("!userInfo" && "cartItems");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    window.location.href = "/login";
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
          <h2>Account Verified</h2>
          <p>
            Your account is now verified. Log Out and Log In to apply the
            changes
          </p>
          <div className="form-btn">
            <button
              className="form-submit-btn"
              onClick={() => {
                verificationHandler();
                signoutHandler();
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifySuccessScreen;
