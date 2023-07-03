import React, { useContext, useEffect, useReducer, useState } from "react";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { Helmet } from "react-helmet-async";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import axios from "axios";
import { getError } from "../../../../components/utilities/util/Utils";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../../../context/Context";
import noimage from "../../../assets/noimage.png";
import { request } from "../../../../base url/BaseUrl";

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

function UserEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: userId } = params;

  const { state } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, loadingUpdate, user }, dispatch] = useReducer(
    reducer,
    {
      user: [],
      loading: true,
      error: "",
    }
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  //FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/users/info/${userId}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhone(data.phone);
        setAddress(data.address);
        setCountry(data.country);
        setIsAdmin(data.isAdmin);
        setIsSeller(data.isSeller);
        setImage(data.image);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
    console.log(userId);
  }, [userId, userInfo]);

  //UPDATE
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${request}/api/users/${userId}`,
        {
          _id: userId,
          firstName,
          lastName,
          email,
          phone,
          address,
          country,
          image,
          isAdmin,
          isSeller,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("User updated successfully", {
        position: "bottom-center",
      });
      navigate("/admin/users");
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  //PROFILE PICTURE
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
      setImage(data.secure_url);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };
  console.log(user);

  return (
    <>
      <Helmet>
        <title>Edit User Info</title>
      </Helmet>
      <div className="container">
        <div className="userEdit">
          <div className="utop">
            <h1>Edit User Info</h1>
          </div>
          <div className="ubottom">
            <div className="left">
              <div className="featured">
                <img src={image ? image : noimage} alt="" />
              </div>
            </div>
            <div className="right">
              <form action="" onSubmit={submitHandler}>
                <div className="formInput ">
                  <label htmlFor="file" className="formInputLabel">
                    Image:{" "}
                    <DriveFolderUploadIcon
                      onChange={uploadFileHandler}
                      className="icon"
                    />
                  </label>
                  <input
                    onChange={uploadFileHandler}
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                  />
                </div>

                <div className="formInput">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="name"
                    placeholder="first name"
                    id="firstName"
                  />
                </div>

                <div className="formInput">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="name"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="">Phone</label>
                  {/* <input type="text" placeholder="+1 234 34 5465" /> */}
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    id="specialInput"
                    className="userUpdateInput"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={setPhone}
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="">Email</label>
                  <input
                    value={email}
                    // disabled={user?.isAdmin}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="tunji@gmail.com"
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    type="text"
                    placeholder="70 Washington Square,"
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="">Country</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    type="text"
                    placeholder="USA"
                  />
                </div>
                <div className="formInput formUserType d_flex">
                  <span className="checkBox a_flex ">
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      id="isAdmin"
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                    <label htmlFor="isAdmin">IsAdmin</label>
                    <input
                      type="checkbox"
                      id="isSeller"
                      checked={isSeller}
                      onChange={(e) => setIsSeller(e.target.checked)}
                    />
                    <label htmlFor="isSeller">IsSeller</label>
                  </span>
                  <button type="submit">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserEdit;
