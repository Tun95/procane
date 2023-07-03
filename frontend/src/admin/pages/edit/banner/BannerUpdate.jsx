import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PublishIcon from "@mui/icons-material/Publish";
import { Helmet } from "react-helmet-async";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import photo from "../../../assets/photo.jpg";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, other: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "UPDATE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "UPDATE_FAIL":
      return { ...state, loadingDelete: false };
    case "UPDATE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };

    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export function BannerUpdate() {
  const params = useParams();
  const { id: bannerId } = params;

  const [title, setTitle] = useState("");
  const [background, setBackground] = useState("");
  const [category, setCategory] = useState("");
  const [descriptions, setDescriptions] = useState("");

  const { state } = useContext(Context);
  const { userInfo, categories } = state;
  const navigate = useNavigate();
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  //========
  //FETCHING
  //========
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/banner/${bannerId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTitle(data.title);
        setBackground(data.background);
        setCategory(data.category);
        setDescriptions(data.descriptions);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [bannerId, userInfo.token]);

  //======
  //UPDATE
  //======
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${request}/api/banner/${bannerId}`,
        {
          title,
          background,
          category,
          descriptions,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Updated successfully", {
        position: "bottom-center",
      });
      navigate("/admin/settings");
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  //===========
  //IMAGE UPLOAD
  //===========
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
      setBackground(data.secure_url);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 210,
      },
    },
  };
  return (
    <>
      <Helmet>
        <title>Update Banner</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <i
              onClick={() => {
                navigate(`/admin/new-banner`);
              }}
              className="fa-solid fa-square-plus"
            ></i>
            <div className="filter-create-box banner_create_box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Update Banner</h1>
                <form
                  onSubmit={submitHandler}
                  action=""
                  className="settingsForm"
                >
                  <div className="settingsItem ">
                    <span className="color_split color_split_split">
                      <input
                        type="text"
                        placeholder="title e.g office chair"
                        className="color_input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <span className="box_shadow ml mb">
                        <img
                          src={background || photo}
                          alt="color"
                          className="banner_image"
                        />
                        <label htmlFor="file">
                          <PublishIcon
                            className="upload-btn color_upload_btn"
                            onChange={uploadFileHandler}
                          />
                        </label>
                        <input
                          onChange={uploadFileHandler}
                          type="file"
                          id="file"
                          style={{ display: "none" }}
                        />
                      </span>
                    </span>
                    <FormControl variant="filled" size="small">
                      <Select
                        value={category}
                        label={category}
                        id="mui_simple_select"
                        className="mui_simple_select"
                        SelectDisplayProps={{
                          style: { paddingTop: 8, paddingBottom: 8 },
                        }}
                        MenuProps={MenuProps}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories?.map((c, index) => (
                          <MenuItem key={index} value={c.category}>
                            {c.category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <textarea
                      name="textarea"
                      placeholder="Your description here..."
                      className="banner_desc"
                      value={descriptions}
                      onChange={(e) => setDescriptions(e.target.value)}
                    ></textarea>
                    <div className="settings-btn">
                      <button className="settingsButton update-btn">
                        Update
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
