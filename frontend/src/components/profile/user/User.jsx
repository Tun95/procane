import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import "../styles/styles.scss";
import { useParams } from "react-router-dom";
import { Context } from "../../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { getError } from "../../utilities/util/Utils";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import LoadingBox from "../../utilities/message loading/LoadingBox";
import MessageBox from "../../utilities/message loading/MessageBox";
import { Helmet } from "react-helmet-async";
import PublishIcon from "@mui/icons-material/Publish";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import me from "../../../assets/me.png";
import { request } from "../../../base url/BaseUrl";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };

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
function User() {
  const editor = useRef(null);

  const params = useParams();
  const { id: userId } = params;
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;
  console.log(userInfo);

  const [{ loading, error, user }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    loadingUpdate: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        setImage(data.image);

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch({ type: "UPDATE_REQUEST" });
      const { data } = await axios.put(
        `${request}/api/users/profile`,
        {
          firstName,
          lastName,
          email,
          phone,
          address,
          image,
          country,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      ctxDispatch({
        type: "USER_SIGNIN",
        payload: data,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("User profile updated successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
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

  //=================
  //VERIFICATION HANDLER
  //=================
  const verificationHandler = async () => {
    // dispatch({ type: "CREATE_REQUEST" });
    try {
      const { data } = await axios.post(
        `${request}/api/users/verification-token`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "CREATE_SUCCESS" });
      toast.success("Verification email sent successfully ", {
        position: "bottom-center",
      });
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  //TOGGLE PASSWOD VIEW
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };
  //TOGGLE PASSWOD VIEW
  const [typeCom, setTypeCom] = useState("password");
  const [iconCom, setIconCom] = useState(eyeOff);

  const handleComToggle = () => {
    if (typeCom === "password") {
      setIconCom(eye);
      setTypeCom("text");
    } else {
      setIconCom(eyeOff);
      setTypeCom("password");
    }
  };

  return (
    <div className="mtb">
      <div className="container ">
        <div className="profile user_profile_page box_shadow">
          <Helmet>
            <title>Profile</title>
          </Helmet>
          <>
            {loading ? (
              <LoadingBox></LoadingBox>
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : (
              <>
                <div className="profile">
                  <div className="profile-styles">
                    <div className="profile_seller">
                      <div className="profile_box">
                        <div className="profile-box">
                          <form
                            onSubmit={submitHandler}
                            className="profile_form"
                          >
                            <div className="profile-form-header">
                              <div className="form_header">
                                <div className="user_image">
                                  <img src={image ? image : me} alt="" />
                                  <input
                                    className="profile-input-box"
                                    id="file"
                                    type="file"
                                    onChange={uploadFileHandler}
                                    style={{ display: "none" }}
                                  />
                                  <label htmlFor="file">
                                    <PublishIcon
                                      className="userUpdateIcon upload-btn"
                                      onChange={uploadFileHandler}
                                    />
                                  </label>
                                </div>
                                <div className="user_details">
                                  <div className="user_detail_list">
                                    <label>Name:</label>
                                    <h4>
                                      {user?.lastName}&#160;{user?.firstName}
                                    </h4>
                                  </div>
                                  <div className="user_detail_list">
                                    <label>Email:</label>
                                    <h4>{user?.email}</h4>
                                  </div>
                                  <div className="user_detail_list">
                                    <label>Address:</label>
                                    <h4>{user?.address}</h4>
                                  </div>
                                  <div className="user_detail_list">
                                    <label>Country:</label>
                                    <h4>{user?.country}</h4>
                                  </div>
                                  <div className="user_detail_list">
                                    <label>Application Status:</label>
                                    {user?.apply[0]?.status === false ? (
                                      <span className="unverified_account a_flex">
                                        declined
                                      </span>
                                    ) : user?.apply[0]?.status === true &&
                                      user.isSeller === true ? (
                                      <span className="verified_account a_flex">
                                        approved
                                      </span>
                                    ) : user?.apply[0]?.status === true &&
                                      user.isSeller === false ? (
                                      <span className="pending_account a_flex">
                                        pending
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                  <div className="user_detail_list">
                                    <label>Status:</label>
                                    {user.isAccountVerified === false ? (
                                      <span className="unverified_account a_flex">
                                        unverified account
                                      </span>
                                    ) : (
                                      <span className="verified_account a_flex">
                                        verified account
                                      </span>
                                    )}
                                  </div>
                                  {!user.isAccountVerified ? (
                                    <div className="verify_now">
                                      <span onClick={verificationHandler}>
                                        Verify Now
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="profile_inner_form">
                              <div className="profile_user_form">
                                <div className="profile_form_group">
                                  <label htmlFor="firstName">First Name </label>
                                  <input
                                    className="profile-input-box"
                                    id="firstName"
                                    type="name"
                                    placeholder="Name"
                                    value={firstName}
                                    onChange={(e) =>
                                      setFirstName(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="lastName">Last Name </label>
                                  <input
                                    className="profile-input-box"
                                    id="lastName"
                                    type="name"
                                    placeholder="Name"
                                    value={lastName}
                                    onChange={(e) =>
                                      setLastName(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="email">Email </label>
                                  <input
                                    className="profile-input-box"
                                    id="email"
                                    type="email"
                                    value={email}
                                    // disabled={userInfo?.isAdmin}
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                  />
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="phone">Phone </label>
                                  <PhoneInput
                                    international
                                    countryCallingCodeEditable={true}
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={setPhone}
                                  />
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="address">Address </label>
                                  <input
                                    className="profile-input-box"
                                    id="address"
                                    type="address"
                                    value={address}
                                    placeholder="address"
                                    onChange={(e) => setAddress(e.target.value)}
                                  />
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="country">Country </label>
                                  <input
                                    className="profile-input-box"
                                    id="country"
                                    type="country"
                                    value={country}
                                    placeholder="country"
                                    onChange={(e) => setCountry(e.target.value)}
                                  />
                                </div>

                                <div className="profile_form_group">
                                  <label htmlFor="password">Password </label>
                                  <input
                                    className="profile-input-box"
                                    id="password"
                                    type={type}
                                    value={password}
                                    // disabled={userInfo?.isAdmin}
                                    placeholder="Password"
                                    onChange={(e) =>
                                      setPassword(e.target.value)
                                    }
                                  />
                                  <span onClick={handleToggle}>
                                    <Icon
                                      icon={icon}
                                      size={20}
                                      className="eye-icon"
                                    />
                                  </span>
                                </div>
                                <div className="profile_form_group">
                                  <label htmlFor="c-password">
                                    Confirm password{" "}
                                  </label>
                                  <input
                                    className="profile-input-box"
                                    id="c-password"
                                    type={typeCom}
                                    value={confirmPassword}
                                    // disabled={userInfo?.isAdmin}
                                    placeholder="Confirm password"
                                    onChange={(e) =>
                                      setConfirmPassword(e.target.value)
                                    }
                                  />
                                  <span onClick={handleComToggle}>
                                    <Icon
                                      icon={iconCom}
                                      size={20}
                                      className="eye-icon"
                                    />
                                  </span>
                                </div>
                              </div>

                              <div className="profile_form_button">
                                <button>Update Profile</button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

export default User;
