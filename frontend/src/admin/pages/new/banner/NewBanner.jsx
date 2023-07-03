import axios from "axios";
import React, { useContext, useReducer } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "./styles.scss";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };

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
export function NewBanner() {
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

  //======
  //CREATE
  //======
  const createHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        `${request}/api/banner`,
        { title, background, category, descriptions },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "CREATE_SUCCESS", payload: data });
      toast.success("Created successfully", {
        position: "bottom-center",
      });
      navigate(`/admin/settings`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
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
        <title>Add New Banner</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box banner_create_box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Banner</h1>
                <form
                  onSubmit={createHandler}
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
                      <button className="settingsButton setting-create">
                        Create
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
