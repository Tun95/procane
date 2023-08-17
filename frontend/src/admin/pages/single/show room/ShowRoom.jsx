import React, { useState, useEffect, useReducer, useContext } from "react";
import axios from "axios";
import { FileUploader } from "react-drag-drop-files";
import { request } from "../../../../base url/BaseUrl";
import "./styles.scss";
import { toast } from "react-toastify";
import { getError } from "../../../../components/utilities/util/Utils";
import { Context } from "../../../../context/Context";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";

const fileTypes = ["JPG", "PNG", "GIF"];

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

const ShowRoom = () => {
  const { state } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const [singleData, setSingleData] = useState({
    smallImage: "",
    largeImage: "",
    titleOne: "",
    titleTwo: "",
    normalText: [],
  });

  const [newText, setNewText] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const fetchData = async () => {
    dispatch({ type: "FETCH_REQUEST" });
    try {
      const response = await axios.get(`${request}/api/showroom`);
      dispatch({ type: "FETCH_SUCCESS", payload: response.data });
      setSingleData(response.data[0]); // Update to set the first ShowRoom in the array
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: "Failed to fetch data" });
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //======
  //UPDATE
  //======
  const handleUpdate = async () => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      const { titleOne, titleTwo, normalText, smallImage, largeImage } =
        singleData;
      const updatedData = {
        titleOne,
        titleTwo,
        normalText,
        smallImage,
        largeImage,
      };

      const response = await axios.put(
        `${request}/api/showroom/${singleData._id}`,
        updatedData
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      setSingleData(response.data);
      console.log("Data updated successfully:", response.data);
      toast.success("Data updated successfully", { position: "bottom-center" });
    } catch (error) {
      dispatch({ type: "UPDATE_FAIL" });
      console.error("Failed to update data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSingleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewTextChange = (e) => {
    setNewText(e.target.value);
  };

  const handleAddText = () => {
    if (newText.trim() === "") return; // Don't add empty text
    setSingleData((prevData) => ({
      ...prevData,
      normalText: [...prevData.normalText, newText],
    }));
    setNewText(""); // Clear the input field after adding text
  };

  const handleEditText = (index) => {
    setNewText(singleData.normalText[index]);
    setEditIndex(index);
  };

  const handleUpdateText = () => {
    if (newText.trim() === "") return; // Don't update with empty text
    setSingleData((prevData) => {
      const updatedNormalText = [...prevData.normalText];
      updatedNormalText[editIndex] = newText;
      return {
        ...prevData,
        normalText: updatedNormalText,
      };
    });
    setNewText("");
    setEditIndex(null);
  };

  const handleDeleteText = (index) => {
    setSingleData((prevData) => {
      const updatedNormalText = prevData.normalText.filter(
        (_, i) => i !== index
      );
      return {
        ...prevData,
        normalText: updatedNormalText,
      };
    });
  };

  //================
  //UPLOAD LARGE IMG
  //================
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
      setSingleData((prevData) => ({
        ...prevData,
        largeImage: data.secure_url, // Set the small image URL in the singleData state
      }));
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  //================
  //UPLOAD SMALL IMG
  //================
  const uploadSmallImageHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_SMALL_REQUEST" });
      const { data } = await axios.post(`${request}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SMALL_SUCCESS" });
      toast.success("Small Image uploaded successfully", {
        position: "bottom-center",
      });
      setSingleData((prevData) => ({
        ...prevData,
        smallImage: data.secure_url, // Set the small image URL in the singleData state
      }));
    } catch (err) {
      dispatch({ type: "UPLOAD_SMALL_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  return (
    <div className="">
      <div className="showroom p_flex">
        <div className="form_box_content">
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox>{error}</MessageBox>
          ) : (
            <>
              <h2>Show Room</h2>
              <div>
                <small className="image-size-info">Large: </small>
                <small className="image-size-info">
                  Recommended size: 1110x350
                </small>
                <img
                  src={singleData.largeImage}
                  alt="Large"
                  className="largeImage"
                />
                <div className="fileUploader">
                  <FileUploader
                    handleChange={(file) => {
                      // Call uploadFileHandler to upload the image and set the URL
                      uploadFileHandler({ target: { files: [file] } });
                    }}
                    name="file"
                    types={fileTypes}
                    id="fileUploader"
                  />
                </div>
              </div>
              <div>
                <div className="d_block">
                  <small className="image-size-info">Small: </small>
                  <small className="image-size-info">
                    Recommended size: 224x224
                  </small>
                </div>
                <img
                  src={singleData.smallImage}
                  alt="Small"
                  className="smallImage"
                />
                <div className="fileUploader">
                  <FileUploader
                    handleChange={(file) => {
                      // Call uploadSmallImageHandler to upload the image and set the URL
                      uploadSmallImageHandler({ target: { files: [file] } });
                    }}
                    name="file"
                    types={fileTypes}
                    id="fileUploader"
                  />
                </div>
              </div>
              <div>
                {/* <h3>{singleData.titleOne}</h3>
                <h3>{singleData.titleTwo}</h3> */}
                <small>Details:</small>
                <ul>
                  {singleData?.normalText?.map((text, index) => (
                    <li key={index}>
                      {index === editIndex ? (
                        <>
                          <input
                            type="text"
                            value={newText}
                            onChange={handleNewTextChange}
                          />
                          <button onClick={handleUpdateText}>Update</button>
                        </>
                      ) : (
                        <>
                          {text}{" "}
                          <button onClick={() => handleEditText(index)}>
                            Edit
                          </button>{" "}
                          <button onClick={() => handleDeleteText(index)}>
                            Delete
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="contact_form_group">
                <div className="form-group">
                  <small>Title:</small>
                  <input
                    type="text"
                    name="titleOne"
                    value={singleData.titleOne}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <small>Title:</small>
                  <input
                    type="text"
                    name="titleTwo"
                    value={singleData.titleTwo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="newText"
                    value={newText}
                    onChange={handleNewTextChange}
                  />
                  <button onClick={handleAddText}>Add Text</button>
                </div>
                <button
                  className="update"
                  disabled={loadingUpdate}
                  onClick={handleUpdate}
                >
                  {loadingUpdate ? <LoadingBox /> : "Update Data"}
                </button>
                {error && <MessageBox>{error}</MessageBox>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowRoom;
