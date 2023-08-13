import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import JoditEditor from "jodit-react";
import PublishIcon from "@mui/icons-material/Publish";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/styles.scss";
import men2 from "../../../assets/men2.png";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../../../context/Context";
import axios from "axios";
import { getError } from "../../../../components/utilities/util/Utils";
import { toast } from "react-toastify";
import { request } from "../../../../base url/BaseUrl";
import photo from "../../../assets/photo.jpg";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import Chart from "../../../components/chart/Chart";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, product: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };

    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    case "FETCH_STATS_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_STATS_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_STATS_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
function ProductEdit() {
  const editor = useRef(null);

  const navigate = useNavigate();
  const params = useParams();
  const { id: productId } = params;

  const { state, convertCurrency, toCurrencies } = useContext(Context);
  const { userInfo, colors, categories, brands, sizes } = state;

  const [{ loading, error, product, loadingUpload, summary }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      summary: { salesData: [] },
      error: "",
    });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [keygen, setKeygen] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [desc, setDesc] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [brand, setBrand] = useState([]);
  const [image, setImage] = useState("");
  const [images, setImages] = useState([]);
  const [flashdeal, setFlashdeal] = useState(false);

  //=====================
  //PRODUCT FETCHING
  //=====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/products/${productId}`
        );
        setName(data.name);
        setSlug(data.slug);
        setKeygen(data.keygen);
        setCountInStock(data.countInStock);
        setPrice(data.price);
        setDiscount(data.discount);
        setDesc(data.desc);
        setWeight(data.weight);
        setCategory(data.category);
        setColor(data.color);
        setSize(data.size);
        setBrand(data.brand);
        setImage(data.image);
        setImages(data.images);
        setFlashdeal(data.flashdeal);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [productId]);
  console.log(product);

  //==============
  //PRODUCT UPDATE
  //==============
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `${request}/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          keygen,
          countInStock,
          price,
          discount,
          desc,
          weight,
          category,
          color,
          size,
          brand,
          image,
          images,
          flashdeal,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Product updated successfully", {
        position: "bottom-center",
      });
      navigate("/admin/products");
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  //============
  //IMAGE UPLOAD
  //============
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

  //============
  //PRODUCT STATS
  //============
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_STATS_REQUEST" });
        const { data } = await axios.get(`${request}/api/orders/summary`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_STATS_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_STATS_FAIL", payload: getError(err) });
        console.log(err);
      }
    };
    fetchData();
  }, [productId, userInfo]);

  const [salesStats, setSalesStats] = useState([]);

  // useEffect(() => {
  //   const getStats = async () => {
  //     product.sold?.map((item) =>
  //       setSalesStats((prev) => [
  //         ...prev,
  //         { name: item.date, Sales: item.value },
  //       ])
  //     );
  //   };
  //   getStats();
  // }, [product.sold]);
  // console.log(summary);
  // const CustomTooltip = ({ active, payload, label }) => {
  //   if (active && payload && payload.length) {
  //     return (
  //       <div className="custom_tooltip" style={{ padding: "10px" }}>
  //         <p className="label">{`${label}`}</p>
  //         <p className="" style={{ color: "#5550bd", marginTop: "3px" }}>
  //           Sales: {payload[0]?.value}
  //         </p>
  //       </div>
  //     );
  //   }

  //   return null;
  // };
  useEffect(() => {
    const getStats = async () => {
      const formattedStats = product.sold?.map((item) => ({
        name: new Date(item.date)
          .toISOString() // Keep the ISO date format for accurate comparison
          .slice(0, 10), // Extract the YYYY-MM-DD part
        Sales: item.value,
      }));

      setSalesStats(formattedStats || []); // Set the state once with the entire array
    };
    getStats();
  }, [product.sold]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedDate = new Date(label)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");

      return (
        <div className="custom_tooltip" style={{ padding: "10px" }}>
          <p className="label">Date: {formattedDate}</p>
          <p className="" style={{ color: "#5550bd", marginTop: "3px" }}>
            Sales: {payload[0]?.value}
          </p>
        </div>
      );
    }

    return null;
  };

  //DELETE IMAGES
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
      <Helmet>
        <title>Product Edit</title>
      </Helmet>
      <div className="container">
        <div className="product_edit">
          <div className="box_shadow mtb">
            <div className="productTitleContainer">
              <h2 className="productTitle featured uppercase">Product Edit </h2>
            </div>
            <div className="productTop d_flex mtb">
              <div className="productTopLeft featured">
                <Chart
                  data={salesStats}
                  CustomTooltip={CustomTooltip}
                  dataKey="Sales"
                  aspect={3 / 1}
                  title="Sales Performance"
                />
              </div>
              <div className="productTopRight featured">
                <div className="productInfoTop">
                  <img src={product.image} alt="" className="productInfoImg" />
                  <div>
                    <span className="productName top_right_label">Name:</span>
                    <span className="productName ">&nbsp;{product.name}</span>
                  </div>
                </div>
                <div className="productInfoBottom">
                  <div className="productInfoItem">
                    <span className="productInfoKey top_right_label">id: </span>
                    <span className="productInfoValue">&nbsp;{productId}</span>
                  </div>
                  <div className="productInfoItem">
                    <span className="productInfoKey top_right_label">
                      sales:
                    </span>
                    <span className="productInfoValue">
                      &nbsp;{product.numSales}
                    </span>
                  </div>

                  <div className="productInfoItem">
                    <span className="productInfoKey top_right_label">
                      in stock:
                    </span>
                    <span className="productInfoValue">
                      &nbsp; {product.countInStock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="productBottom">
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
                      <label htmlFor="weight">Weight</label>
                      <input
                        type="text"
                        id="weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="225 in kg"
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
                        placeholder="/imgs/couch.png"
                      />
                      <span className="check_box">
                        <input
                          type="checkbox"
                          checked={flashdeal}
                          id="flashdeal"
                          className="flashdeal"
                          onChange={(e) => setFlashdeal(e.target.checked)}
                        />
                        <label htmlFor="flashdeal">Add to Flashdeal</label>
                      </span>
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
                        Brand
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
                        className="productUploadImg main_img"
                      />
                      {image && loadingUpload && <LoadingBox></LoadingBox>}
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
                      <label htmlFor="files" className="products-images-upload">
                        {images.length === 0 && (
                          <MessageBox>No Image</MessageBox>
                        )}
                        {images && loadingUpload && <LoadingBox></LoadingBox>}
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
                <button className="productButton main_btn mtb">
                  Update All
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductEdit;
