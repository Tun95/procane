import React, { useContext, useEffect, useReducer, useState } from "react";
import axios from "axios";
import { Context } from "../../../../context/Context";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import { request } from "../../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../../components/utilities/util/Utils";
import PublishIcon from "@mui/icons-material/Publish";
import "./styles.scss";

const initialState = {
  loading: false,
  error: null,
  settings: null,
  loadingUpdate: false,
  successUpdate: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, settings: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, successUpdate: true };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPDATE_RESET":
      return {
        ...state,
        loadingUpdate: false,
        successUpdate: false,
      };

    default:
      return state;
  }
};

function Settings() {
  const { state: contextState } = useContext(Context);
  const { userInfo } = contextState;

  const [state, dispatch] = useReducer(reducer, initialState);
  const [updatedSettings, setUpdatedSettings] = useState({}); // State to hold updated settings

  //=======
  // FETCH
  //=======
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch({ type: "FETCH_REQUEST" });

      try {
        const response = await axios.get(`${request}/api/settings`);
        const [firstSettings] = response.data; // Extract the first object from the array
        dispatch({ type: "FETCH_SUCCESS", payload: firstSettings });

        // Set the initial values for updatedSettings from the fetched data
        setUpdatedSettings(firstSettings); // Use the extracted object
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: error.message });
      }
    };

    fetchSettings();
  }, []);

  //========
  // UPDATE
  //========
  const handleUpdate = async () => {
    console.log("updatedSettings:", updatedSettings); // Add this line for debugging
    dispatch({ type: "UPDATE_REQUEST" });

    try {
      const response = await axios.put(
        `${request}/api/settings/${updatedSettings._id}`, // Add the _id to the URL
        updatedSettings
      );
      dispatch({ type: "UPDATE_SUCCESS", payload: response.data });
      toast.success("Update successfully", { position: "bottom-center" });
    } catch (error) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(error) });
      toast.error(getError(error), { position: "bottom-center" });
    }
  };
  // Handle input changes and update the updatedSettings object
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedSettings({ ...updatedSettings, [name]: value });
  };

  //LOGO UPLOAD
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(`${request}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      toast.success("Image uploaded successfully", {
        position: "bottom-center",
      });

      // Update the logo URL in the updatedSettings state
      setUpdatedSettings({
        ...updatedSettings,
        logo: data.secure_url, // Update the "logo" field with the image URL
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  //FAVICON UPLOAD
  const uploadFavHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(`${request}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      toast.success("Image uploaded successfully", {
        position: "bottom-center",
      });

      // Update the favicon URL in the updatedSettings state
      setUpdatedSettings({
        ...updatedSettings,
        faviconUrl: data.secure_url, // Update the "faviconUrl" field with the image URL
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  return (
    <div className="main_settings new_settings">
      {state.loading ? (
        <LoadingBox></LoadingBox>
      ) : state.error ? (
        <MessageBox variant="danger">{state.error}</MessageBox>
      ) : (
        <>
          {/* Display and edit the settings here */}
          <form className="content_settings light_shadow">
            <div className="lower_form">
              <div>
                <h4>Settings:</h4>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Set your tax percentage:</small>
                      <input
                        type="text"
                        className="sub_input"
                        name="tax"
                        value={updatedSettings.tax || ""}
                        onChange={handleInputChange}
                        placeholder="e.g 0.2"
                      />
                    </span>

                    <span className="flex_row">
                      <small>Set minimum withdrawal amount:</small>
                      <input
                        type="text"
                        className="sub_input"
                        name="minimumWithdrawalAmount"
                        value={updatedSettings.minimumWithdrawalAmount || ""}
                        onChange={handleInputChange}
                        placeholder="e.g 200"
                      />
                    </span>
                  </span>
                </div>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Set your default currency:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="currency"
                        value={updatedSettings.currency || ""}
                        onChange={handleInputChange}
                        placeholder="USD"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Stripe Public key:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="stripePubKey"
                        value={updatedSettings.stripePubKey || ""}
                        onChange={handleInputChange}
                        placeholder="stripe pub. key"
                      />
                    </span>
                  </span>
                </div>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Shipping Method:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="express"
                        value={updatedSettings.express || ""}
                        onChange={handleInputChange}
                        placeholder="express"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Charges:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="expressCharges"
                        value={updatedSettings.expressCharges || ""}
                        onChange={handleInputChange}
                        placeholder="e.g 200"
                      />
                    </span>
                  </span>
                </div>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Shipping Method:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="standard"
                        value={updatedSettings.standard || ""}
                        onChange={handleInputChange}
                        placeholder="standard"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Charges:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="standardCharges"
                        value={updatedSettings.standardCharges || ""}
                        onChange={handleInputChange}
                        placeholder="e.g 200"
                      />
                    </span>
                  </span>
                </div>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Your messenger nick name here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="messenger"
                        value={updatedSettings.messenger || ""}
                        onChange={handleInputChange}
                        placeholder="messenger"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Your facebook profile link here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="facebook"
                        value={updatedSettings.facebook || ""}
                        onChange={handleInputChange}
                        placeholder="facebook"
                      />
                    </span>
                  </span>
                </div>{" "}
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Your twitter profile link here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="twitter"
                        value={updatedSettings.twitter || ""}
                        onChange={handleInputChange}
                        placeholder="twitter"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Your email here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="email"
                        value={updatedSettings.email || ""}
                        onChange={handleInputChange}
                        placeholder="email"
                      />
                    </span>
                  </span>
                </div>{" "}
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Your playStore app link here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="playstore"
                        value={updatedSettings.playstore || ""}
                        onChange={handleInputChange}
                        placeholder="playstore"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Your AppStore app link here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="appstore"
                        value={updatedSettings.appstore || ""}
                        onChange={handleInputChange}
                        placeholder="appstore"
                      />
                    </span>
                  </span>
                </div>{" "}
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Your whatSapp number here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="whatsapp"
                        value={updatedSettings.whatsapp || ""}
                        onChange={handleInputChange}
                        placeholder="whatsapp"
                      />
                    </span>
                  </span>
                </div>{" "}
                <div className="lower_group">
                  <h3>Your Store Info here:</h3>
                  <div className="a_flex">
                    <div className="logo_image mr">
                      <small>logo:</small>
                      <div className="a_flex">
                        <img
                          src={updatedSettings.logo}
                          alt="store logo"
                          className="logo store_logo"
                        />
                        <span>
                          <label htmlFor="logo">
                            <PublishIcon
                              onChange={uploadFileHandler}
                              className="userUpdateIcon upload-btn"
                            />{" "}
                          </label>
                          <input
                            onChange={uploadFileHandler}
                            type="file"
                            id="logo"
                            style={{ display: "none" }}
                          />{" "}
                        </span>
                      </div>
                    </div>
                    <div className="logo_image">
                      <small>favicon:</small>
                      <div className="a_flex">
                        <img
                          src={updatedSettings.faviconUrl}
                          alt="store logo"
                          className="logo"
                        />
                        <span>
                          <label htmlFor="favicon">
                            <PublishIcon
                              onChange={uploadFavHandler}
                              className="userUpdateIcon upload-btn"
                            />{" "}
                          </label>
                          <input
                            onChange={uploadFavHandler}
                            type="file"
                            id="favicon"
                            style={{ display: "none" }}
                          />{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lower_group">
                  <span className="d_flex">
                    <span className="flex_row">
                      <small>Your Store name here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="webname"
                        value={updatedSettings.webname || ""}
                        onChange={handleInputChange}
                        placeholder="web name"
                      />
                    </span>
                    <span className="flex_row">
                      <small>Your Store address here:</small>
                      <input
                        className="sub_input"
                        type="text"
                        name="storeAddress"
                        value={updatedSettings.storeAddress || ""}
                        onChange={handleInputChange}
                        placeholder="store address"
                      />
                    </span>
                  </span>
                </div>
                <div className="lower_group">
                  <small>Your store short description here:</small>
                  <textarea
                    name="about_store"
                    id="about_store"
                    cols="30"
                    rows="10"
                    className="about_store"
                    value={updatedSettings.shortDesc || ""}
                    onChange={handleInputChange}
                    placeholder="short store description..."
                  ></textarea>
                </div>
              </div>
            </div>
          </form>

          <button
            className="btn"
            onClick={handleUpdate}
            disabled={state.loadingUpdate}
          >
            {state.loadingUpdate ? "Updating..." : "Update all"}
          </button>
        </>
      )}
    </div>
  );
}

export default Settings;
