import axios from "axios";
import React, { useContext, useReducer } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./styles.scss";
import PublishIcon from "@mui/icons-material/Publish";
import gray from "../../../assets/gray.png";
import { Helmet } from "react-helmet-async";
import { Context } from "../../../../context/Context";
import { getError } from "../../../../components/utilities/util/Utils";
import { request } from "../../../../base url/BaseUrl";
import cat1 from "../../../assets/cat1.png";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};
export function Category() {
  const [category, setCategory] = useState("");
  const [categoryImg, setCategoryImg] = useState("");

  const { state } = useContext(Context);
  const { userInfo } = state;
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
    if (!category) {
      toast.error("Category input box is empty", { position: "bottom-center" });
    } else {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${request}/api/category`,
          { category, categoryImg },
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
    }
  };

  //===========
  //IMAGE UPLOAD
  //===========
  const uploadFileHandler = async (e, forImages) => {
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
      setCategoryImg(data.secure_url);
      toast.success("Image uploaded successfully. Click update to apply it", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Category</title>
      </Helmet>
      <div className="new-settings-edit container ">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Category</h1>
                <form
                  action=""
                  className="settingsForm"
                  onSubmit={createHandler}
                >
                  <div className="settingsItem ">
                    <span className="color_split color_split_split">
                      <input
                        type="text"
                        placeholder="category e.g office chair"
                        className="color_input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                      <img
                        src={categoryImg || cat1}
                        alt="color"
                        className="color_image"
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
                    <div className="settings-btn Filterbtn">
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

export function Brand() {
  const [brand, setBrand] = useState("");

  const { state } = useContext(Context);
  const { userInfo } = state;
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
    if (!brand) {
      toast.error("Brand input box is empty", { position: "bottom-center" });
    } else {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${request}/api/brand`,
          { brand },
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
    }
  };

  return (
    <>
      <Helmet>
        <title>Add New Brand</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Brand</h1>
                <form
                  action=""
                  className="settingsForm"
                  onSubmit={createHandler}
                >
                  <div className="settingsItem ">
                    <input
                      type="text"
                      placeholder="brand e.g Nike"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                    <div className="settings-btn Filterbtn">
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

export function Size() {
  const [size, setSize] = useState("");

  const { state } = useContext(Context);
  const { userInfo } = state;
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
    if (!size) {
      toast.error("Size input box is empty", { position: "bottom-center" });
    } else {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${request}/api/size`,
          { size },
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
    }
  };
  return (
    <>
      <Helmet>
        <title>Add New Size</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Size</h1>
                <form
                  action=""
                  className="settingsForm"
                  onSubmit={createHandler}
                >
                  <div className="settingsItem ">
                    <input
                      type="text"
                      placeholder="32 Fit by 12 Fit"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                    <div className="settings-btn Filterbtn">
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

export function Price() {
  const [price, setPrice] = useState("");
  const [priceSpan, setPriceSpan] = useState("");

  const { state } = useContext(Context);
  const { userInfo } = state;
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
    if (!price || !priceSpan) {
      toast.error("Please add your price range", { position: "bottom-center" });
    } else {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${request}/api/price`,
          { price, priceSpan },
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
    }
  };
  return (
    <>
      <Helmet>
        <title>Add New Price</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Price Range</h1>
                <form
                  action=""
                  className="settingsForm"
                  onSubmit={createHandler}
                >
                  <div className="settingsItem ">
                    <span className="color_split ">
                      <input
                        type="text"
                        placeholder="price e.g 10-20"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="price e.g £10-£20"
                        value={priceSpan}
                        onChange={(e) => setPriceSpan(e.target.value)}
                      />
                    </span>

                    <div className="settings-btn Filterbtn">
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

export function Color() {
  const [color, setColor] = useState();
  const [colorName, setColorName] = useState();

  const { state } = useContext(Context);
  const { userInfo } = state;
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
    if (!color || !colorName) {
      toast.error("Please add color first", { position: "bottom-center" });
    } else {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${request}/api/color`,
          { color, colorName },
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
    }
  };

  //===========
  //IMAGE UPLOAD
  //===========
  const uploadFileHandler = async (e, forImages) => {
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
      setColor(data.secure_url);
      toast.success(
        "Color image uploaded successfully. Click update to apply it",
        {
          position: "bottom-center",
        }
      );
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };
  return (
    <>
      <Helmet>
        <title>Add New Color</title>
      </Helmet>
      <div className="new-settings-edit container">
        <div className="new-box box_shadow mtb">
          <div className="settings ">
            <div className="filter-create-box">
              <div className="FilterForm">
                <h1 className="settingsTitle">Add New Color</h1>
                <form
                  action=""
                  className="settingsForm"
                  onSubmit={createHandler}
                >
                  <div className="settingsItem ">
                    <span className="color_split color_split_split">
                      <input
                        type="text"
                        placeholder="color e.g red"
                        className="color_input"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                      />
                      <img
                        src={color || gray}
                        alt="color"
                        className="color_image"
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
                    <div className="settings-btn Filterbtn">
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
