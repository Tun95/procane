import React, { useReducer, useRef } from "react";
import "./styles.scss";
import axios from "axios";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { request } from "../../../../base url/BaseUrl";
import { toast } from "react-toastify";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";

const fileTypes = ["ZIP"];

const initialState = {
  loadingUpdate: false,
  updateError: null,
  updateSuccess: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "UPLOAD_REQUEST":
      return {
        ...state,
        loadingUpdate: true,
        updateError: null,
        updateSuccess: false,
      };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpdate: false,
        updateSuccess: true,
      };
    case "UPLOAD_FAIL":
      return {
        ...state,
        loadingUpdate: false,
        updateError: action.payload,
      };
    default:
      return state;
  }
};

function Updates() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    handleUpdateUpload(selectedFile);
  };

  const handleUpdateUpload = async (file) => {
    dispatch({ type: "UPLOAD_REQUEST" });

    const formData = new FormData();
    formData.append("updateZip", file);

    try {
      const response = await axios.post(
        `${request}/api/updates/apply-update`,
        formData
      );
      console.log("Update applied successfully:", response.data);
      dispatch({ type: "UPLOAD_SUCCESS" });
      toast.success("Update applied successfully!", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Error applying the update:", error);
      dispatch({ type: "UPLOAD_FAIL", payload: error.message });
      toast.error(`Error applying the update: ${error.message}`, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="update">
      <div className="light_shadow l_flex">
        <div className="content">
          <div className="update_header">
            <h4>Upload New Update</h4>
          </div>
          <div className="description">
            <p>
              Please click the 'Upload' button to browse your device and select
              the ZIP file containing the update. Once selected, your update will
              be automatically installed
            </p>
          </div>
          <div className="uploader">
            <div>
              <div className="file_handler">
                <span className="zip"> Select a ZIP file:</span>
                <label htmlFor="fileInput">
                  <input
                    type="file"
                    id="fileInput"
                    className="fileInput"
                    accept=".zip"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    disabled={state.loadingUpdate}
                    style={{ display: "none" }}
                  />
                  <span className="uploader_box l_flex">
                    <AddPhotoAlternateOutlinedIcon className="icon" />
                    <span className="text">
                      {" "}
                      select and upload a zip file update
                    </span>
                  </span>
                </label>
              </div>
              <div className="success_error">
                {state.updateSuccess && (
                  <MessageBox>Update applied successfully!</MessageBox>
                )}
                {state.updateError && (
                  <MessageBox variant="danger">{state.updateError}</MessageBox>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Updates;
