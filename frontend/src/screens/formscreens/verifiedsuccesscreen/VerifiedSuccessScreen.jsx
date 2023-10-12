import React, { useContext, useState } from "react";
import { Context } from "../../../context/Context";
import DoneIcon from "@mui/icons-material/Done";

function VerifiedSuccessScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [loading, setLoading] = useState(false); // Add loading state

  // Log Out function
  const signoutHandler = () => {
    setLoading(true); // Set loading to true when log out starts

    // Perform the log out action
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("!userInfo" && "cartItems");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");

    // Simulate a delay for demonstration purposes (remove this in your actual code)
    setTimeout(() => {
      setLoading(false); // Set loading to false when log out is completed
      window.location.href = "/login";
    }, 2000); // Replace with your actual log out logic
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
              disabled={loading} // Disable the button when loading
            >
              {loading ? "Logging Out..." : "Log Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifiedSuccessScreen;
