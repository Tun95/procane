import React from "react";
import "./styles.scss";
import { Link } from "react-router-dom";

function UserModal() {
  return (
    <div>
      <div className="user_modal_bg">
        <div className="user_modal_list">
          <ul className="user_modal_box">
            <Link to="">
              <li>Profile</li>
            </Link>
            <Link to="/wish-list">
              <li>Wish List</li>
            </Link>
            <Link to="">
              <li>Profile</li>
            </Link>
            <hr />
            <hr />
            <Link to="/admin/dashboard">
              <li>Dashboard</li>
            </Link>
            <Link to="/admin/products">
              {" "}
              <li>Products</li>
            </Link>
            <Link to="/admin/users">
              <li>Users</li>
            </Link>
            <Link to="/admin/vendors">
              <li>Vendors</li>
            </Link>
            <Link to="/admin/orders">
              <li>Orders</li>
            </Link>
            <Link to="/admin/settings">
              <li>Settings</li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
