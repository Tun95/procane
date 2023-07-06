import React, { useContext, useReducer, useState } from "react";
import "./styles.scss";
import { toast } from "react-toastify";
import axios from "axios";
import { getError } from "../../utilities/util/Utils";
import { Context } from "../../../context/Context";
import { request } from "../../../base url/BaseUrl";
import EmailIcon from "@mui/icons-material/Email";

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
function Subscribe() {
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings, userInfo } = state;

  const [email, setEmail] = useState();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("email field is required", { position: "bottom-center" });
    } else {
      try {
        const { data } = await axios.post(`${request}/api/message/subscribe`, {
          email,
        });
        dispatch({ type: "POST_SUCCESS", payload: data });
        toast.success("You have successfully subscribe to our newsletter", {
          position: "bottom-center",
        });
      } catch (err) {
        toast.error(getError(err), { position: "bottom-center" });
        dispatch({ type: "POST_FAIL" });
      }
    }
  };

  return (
    <div className="background">
      <div className="box_shadow subscribe_box">
        <div className="container">
          <div className="form_group">
            <form action="" onSubmit={submitHandler} className=" d_flex">
              <div className=" search-box ">
                <EmailIcon className="email_box" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="search_filter"
                  placeholder="Email"
                />
              </div>

              <div className="btn">
                <button onClick={submitHandler}>subscribe</button>
              </div>
            </form>
          </div>
        </div>
        <span>
          <small className="text_small">
            Subscribe to our newsletter today for furniture updates, exclusive
            offers, and design inspiration{" "}
          </small>
        </span>
      </div>
    </div>
  );
}

export default Subscribe;
