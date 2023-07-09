import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();

  const closeHandler = () => {
    navigate("/");
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
          <h2>Application Submitted</h2>
          <p>
            Your application to become a merchant is now submitted. Awaiting
            Admin approval
          </p>
          <div className="form-btn">
            <button onClick={closeHandler} className="form-submit-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;
