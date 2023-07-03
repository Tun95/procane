import React from "react";
import "../styles/styles.scss";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import noimage from "../../../../assets/images/noimage.png";

function NewUser() {
  const [file, setFile] = useState();
  const [phone, setPhone] = useState("");
  return (
    <>
      <Helmet>
        <title>Add New User</title>
      </Helmet>
      <div className="container">
        <div className="userEdit">
          <div className="utop">
            <h1>Add New User</h1>
          </div>
          <div className="ubottom">
            <div className="left">
              <div className="featured">
                <img src={file ? URL.createObjectURL(file) : noimage} alt="" />
              </div>
            </div>
            <div className="right">
              <form action="">
                <div className="formInput ">
                  <label htmlFor="file" className="formInputLabel">
                    Image: <DriveFolderUploadIcon className="icon" />
                  </label>
                  <input
                    onChange={(e) => setFile(e.target.files[0])}
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                  />
                </div>

                <div className="formInput">
                  <label htmlFor="name">First Name</label>
                  <input type="name" placeholder="first name" id="name" />
                </div>
                <div className="formInput">
                  <label htmlFor="">Email</label>
                  <input type="email" placeholder="tunji@gmail.com" />
                </div>
                <div className="formInput">
                  <label htmlFor="">Phone</label>
                  {/* <input type="text" placeholder="+1 234 34 5465" /> */}
                  <PhoneInput
                    placeholder="Enter phone number"
                    className="phoneInput"
                    value={phone}
                    onChange={setPhone}
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="">Password</label>
                  <input type="password" />
                </div>
                <div className="formInput">
                  <label htmlFor="">Address</label>
                  <input type="text" placeholder="70 Washington Square," />
                </div>
                <div className="formInput">
                  <label htmlFor="">Country</label>
                  <input type="text" placeholder="USA" />
                </div>
                <div className="formInput formUserType d_flex">
                  <span className="checkBox a_flex ">
                    <input type="checkbox" id="isAdmin" />
                    <label htmlFor="isAdmin">IsAdmin</label>
                    <input type="checkbox" id="isSeller" />
                    <label htmlFor="isSeller">IsSeller</label>
                  </span>
                  <button type="submit">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewUser;
