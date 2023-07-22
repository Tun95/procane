import React, { useContext, useReducer, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import PublishIcon from "@mui/icons-material/Publish";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";

import photo from "../../../../admin/assets/photo.png";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";

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
function SellerNewProduct() {
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const { state } = useContext(Context);
  const { userInfo, colors, categories, brands, sizes } = state;

  const navigate = useNavigate();

  const editor = useRef(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [keygen, setKeygen] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [desc, setDesc] = useState("");

  const [category, setCategory] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [brand, setBrand] = useState([]);
  const [image, setImage] = useState("");
  const [images, setImages] = useState([]);

  //=================
  // CREATE PRODUCT
  //=================
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "CREATE_REQUEST" });

      if (!name) {
        toast.error("Please enter product name", { position: "bottom-center" });
        return;
      }

      if (!slug) {
        toast.error("Please enter product slug", { position: "bottom-center" });
        return;
      }
      if (!price) {
        toast.error("Please add product price", { position: "bottom-center" });
        return;
      }
      if (!image) {
        toast.error("Please select an image", { position: "bottom-center" });
        return;
      }

      await axios.post(
        `${request}/api/products`,
        {
          name,
          slug,
          keygen,
          countInStock,
          price,
          discount,
          desc,
          category,
          color,
          size,
          brand,
          image,
          images,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: "CREATE_SUCCESS" });
      toast.success("Product created successfully", {
        position: "bottom-center",
      });
      navigate("/vendor/products");
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "CREATE_FAIL" });
    }
  };

  //=================
  // IMAGES UPLOAD
  //=================
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
      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success("Image uploaded successfully. Click update to apply it", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  //=================
  //DELETE IMAGES
  //=================
  const deleteFileHandler = async (fileName) => {
    setImages(images.filter((x) => x !== fileName));
    toast.success("Image removed successfully. Click update to apply it", {
      position: "bottom-center",
    });
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
      <>
        <Helmet>
          <title>Add New Product</title>
        </Helmet>
        <div className="container">
          <div className="product_edit">
            <div className="box_shadow mtb">
              <div className="productTitleContainer">
                <h2 className="productTitle featured uppercase">
                  New Product{" "}
                </h2>
              </div>
              <div className="productBottom mtb">
                <form action="" onSubmit={submitHandler}>
                  <div className="productForm">
                    <div className="productFormLeft_styles">
                      <div className="productFormLeft productFormLeft-one">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          maxLength="23"
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Bracelet Armchair Fendi"
                        />
                        <label htmlFor="slug">Slug</label>
                        <input
                          type="text"
                          id="slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="Bracelet Armchair Fendi"
                        />
                        <label htmlFor="keygen">Keygen</label>
                        <input
                          type="text"
                          id="keygen"
                          value={keygen}
                          onChange={(e) => setKeygen(e.target.value)}
                          placeholder="SKU BK3569"
                        />
                        <label htmlFor="qty">Quantity</label>
                        <input
                          type="text"
                          id="qty"
                          value={countInStock}
                          onChange={(e) => setCountInStock(e.target.value)}
                          placeholder="123"
                        />
                      </div>
                      <div className="productFormLeft productFormLeft-Two">
                        <label htmlFor="category" className="ccatb-des">
                          Category
                        </label>
                        <FormControl
                          variant="filled"
                          size="small"
                          id="formControl"
                        >
                          <Select
                            labelId="mui-simple-select-label"
                            id="mui_simple_select"
                            multiple
                            MenuProps={MenuProps}
                            SelectDisplayProps={{
                              style: { paddingTop: 8, paddingBottom: 8 },
                            }}
                            value={category}
                            label={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {categories?.map((c, index) => (
                              <MenuItem key={index} value={c.category}>
                                {c.category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <label htmlFor="color" className="ccatb-des">
                          Color
                        </label>
                        <FormControl
                          variant="filled"
                          size="small"
                          id="formControl"
                        >
                          {/* <InputLabel id="mui-simple-select-label">
                        Color
                      </InputLabel> */}
                          <Select
                            labelId="mui-simple-select-label"
                            id="mui_simple_select"
                            multiple
                            MenuProps={MenuProps}
                            SelectDisplayProps={{
                              style: { paddingTop: 8, paddingBottom: 8 },
                            }}
                            value={color}
                            label={color}
                            onChange={(e) => setColor(e.target.value)}
                          >
                            {colors?.map((c, index) => (
                              <MenuItem key={index} value={c.color}>
                                <img
                                  src={c.color}
                                  alt={c.color}
                                  className="color_image_size"
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <label htmlFor="img" className="ccatb-des">
                          Image
                        </label>
                        <input
                          type="text"
                          id="img"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="/imgs/kid1.png"
                        />
                      </div>
                      <div className="productFormLeft productFormLeft-three">
                        <label htmlFor="size">Size</label>
                        <FormControl
                          variant="filled"
                          size="small"
                          id="formControl"
                        >
                          {/* <InputLabel id="mui-simple-select-label">Size</InputLabel> */}
                          <Select
                            labelId="mui-simple-select-label"
                            id="mui_simple_select"
                            multiple
                            MenuProps={MenuProps}
                            SelectDisplayProps={{
                              style: { paddingTop: 8, paddingBottom: 8 },
                            }}
                            value={size}
                            label={size}
                            onChange={(e) => setSize(e.target.value)}
                          >
                            {sizes?.map((s, index) => (
                              <MenuItem key={index} value={s.size}>
                                {s.size}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <label htmlFor="brand" className="ccatb-des">
                          Manufacturer
                        </label>
                        <FormControl
                          variant="filled"
                          size="small"
                          id="formControl"
                        >
                          <Select
                            labelId="mui-simple-select-label"
                            id="mui_simple_select"
                            multiple
                            MenuProps={MenuProps}
                            SelectDisplayProps={{
                              style: { paddingTop: 8, paddingBottom: 8 },
                            }}
                            value={brand}
                            label={brand}
                            onChange={(e) => setBrand(e.target.value)}
                          >
                            {brands?.map((b, index) => (
                              <MenuItem key={index} value={b.brand}>
                                {b.brand}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <label htmlFor="price">Price</label>
                        <input
                          type="text"
                          id="price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="23"
                        />
                        <label htmlFor="discount">Discount</label>
                        <input
                          type="text"
                          id="discount"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <div className="productFormRight mtb c_flex">
                      <div className="productUpload box_shadow">
                        <img
                          src={image || photo}
                          alt=""
                          className="productUploadImg"
                        />
                        {/* {image === loadingUpload && <LoadingBox></LoadingBox>} */}
                        <label htmlFor="file">
                          <PublishIcon
                            className="upload-btn"
                            onChange={uploadFileHandler}
                          />
                        </label>
                        <input
                          onChange={uploadFileHandler}
                          type="file"
                          id="file"
                          style={{ display: "none" }}
                        />
                      </div>
                      <div className="productUpload box_shadow mtb">
                        <div className="productUploadImg-delete">
                          {images.map((x) => (
                            <div key={x}>
                              <img
                                src={x}
                                alt=""
                                className="productUploadImg wtdh-imgs small_imgs"
                              />
                              <DeleteIcon
                                onClick={() => deleteFileHandler(x)}
                                className="deleteImages"
                              />
                            </div>
                          ))}
                        </div>
                        <label
                          htmlFor="files"
                          className="products-images-upload"
                        >
                          {/* {images.length === 0 && <MessageBox>No Image</MessageBox>} */}
                          {/* {images && loadingUpload && <LoadingBox></LoadingBox>} */}
                          <PublishIcon
                            className="upload-btn images-list-l"
                            onChange={(e) => uploadFileHandler(e, true)}
                          />
                        </label>
                        <input
                          style={{ display: "none" }}
                          type="file"
                          id="files"
                          onChange={(e) => uploadFileHandler(e, true)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="lower_test">
                    <label htmlFor="">Description</label>
                    <JoditEditor
                      className="editor"
                      id="desc"
                      ref={editor}
                      value={desc}
                      // config={config}
                      tabIndex={1} // tabIndex of textarea
                      onBlur={(newContent) => setDesc(newContent)} // preferred to use only this option to update the content for performance reasons
                      onChange={(newContent) => {}}
                    />
                  </div>
                  <button className="productButton main_btn mtb ">
                    Add New
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default SellerNewProduct;
