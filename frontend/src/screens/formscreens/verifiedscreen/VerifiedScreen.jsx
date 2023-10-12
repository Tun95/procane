import React, { useContext, useReducer } from "react";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
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

function VerifyScreen() {
  const params = useParams();
  const { token, id: userId } = params;

  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectUnUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectUnUrl ? redirectUnUrl : "/";

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    order: {},
    error: "",
  });

  const verificationHandler = async () => {
    dispatch({ type: "VERIFY_REQUEST" }); // Set loading to true when verification starts.

    try {
      const { data } = await axios.put(
        `${request}/api/users/verify-account/${userId}`,
        { token },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "VERIFY_SUCCESS" });
      navigate(redirect || "/");
      toast.success("Account verified successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      dispatch({ type: "VERIFY_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  return (
    <div className="form-box">
      <div className="form-box-content">
        <div className="inner-form inner-form-small">
          <div className="form-icon-done">
            <span className="form-icon-span question">
              <QuestionMarkOutlinedIcon className="form-icon" />
            </span>
          </div>
          <h2>Verify Now</h2>
          <p>Click on the button down below to verify your account?</p>
          <div className="form-btn">
            <button
              className="form-submit-btn"
              onClick={() => verificationHandler()}
              disabled={loading} // Disable the button when loading
            >
              {loading ? "Verifying..." : "Verify Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyScreen;
