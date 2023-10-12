import React, { useContext } from "react";
import { Context } from "../../../context/Context";
import DoneIcon from "@mui/icons-material/Done";

function VerifiedSuccessScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

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
              onClick={() => signoutHandler()}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifiedSuccessScreen;
