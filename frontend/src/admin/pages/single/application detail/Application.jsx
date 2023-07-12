import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../../../base url/BaseUrl";
import { Context } from "../../../../context/Context";
import { getError } from "../../../../components/utilities/util/Utils";
import photo from "../../../assets/photo.jpg";
import "./styles.scss";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, application: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, errors: action.payload };

    default:
      return state;
  }
};

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}
function Application() {
  const params = useParams();
  const { id: appId } = params;

  const { state } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, application }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    application: [],
  });

  //FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/apply/${appId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [appId, userInfo]);
  console.log(application);
  return (
    <div className="mtb">
      <div className="container apply_content">
        <div className="box_shadow">
          <div className="light_shadow">
            <div className="seller_details f_flex">
              <div className="seller_img">
                <img
                  src={application?.user?.image || photo}
                  alt={application?.user?.seller?.name}
                  className="img"
                />
              </div>
              <div className="seller_info">
                <div className="seller_name a_flex">
                  <h4>Store name:</h4>
                  <span className="info">{application.sellerName}</span>
                </div>
                <div className="seller_member a_flex ">
                  <h4>Store address:</h4>
                  <span className="info">{application.storeAddress}</span>
                </div>
                <div className="seller_member a_flex">
                  <h4>Member since:</h4>
                  <span className="info">
                    {formatDate(application?.user?.createdAt)}
                  </span>
                </div>
                <div className="seller_member a_flex">
                  <h4>Application status:</h4>
                  {application.status === false ? (
                    <span className="unverified_account a_flex">declined</span>
                  ) : application.status === true ? (
                    <span className="verified_account a_flex">approved</span>
                  ) : application.status === true ? (
                    <span className="pending_account a_flex">pending</span>
                  ) : (
                    ""
                  )}
                </div>
                <div className="seller_member a_flex">
                  <h4>Email:</h4>
                  <small className="info">
                    <a
                      href={`mailto:${application?.user?.email}`}
                      className="contact_seller"
                    >
                      {application?.user?.email}
                    </a>
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="light_shadow mt">
            <h4>About:</h4>
            <small>{application.sellerDescription}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Application;
