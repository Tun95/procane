import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import SideBar from "../side bar/SideBar";
import { Context } from "../../context/Context";
import { Divider } from "@mui/material";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme, darkMode }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    color: darkMode ? "#ffffff" : "#2e2e2e",
    backgroundColor: darkMode ? "rgb(0,0,0,0.8)" : "", // Add this line
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "15px",
    },
    "& .MuiMenuItem-root": {
      margin: "5px 0px",
      color: darkMode ? "#ffffff" : "#2e2e2e",
      padding: "5px 60px",
      fontWeight: "500",
      transition: "all 500ms ease",

      "& .MuiSvgIcon-root": {
        fontSize: 16,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:hover": {
        backgroundColor: darkMode ? "#2e2e2e" : "", // Change to the desired hover color
      },
    },
  },
}));

const StyledDivider = styled(Divider)(({ theme, darkMode }) => ({
  backgroundColor: darkMode ? "#ffffff" : "", // Change colors accordingly
}));

function Search() {
  // window.addEventListener("scroll", function () {
  //   const search = document.querySelector(".search");
  //   search.classList.toggle("active", window.scrollY > 100);
  // });

  const { state, dispatch: ctxDispatch, darkMode } = useContext(Context);
  const { cart, userInfo, settings } = state;

  const { logo } =
    (settings &&
      settings
        .map((s) => ({
          logo: s.logo,
        }))
        .find(() => true)) ||
    {};
  //=========
  //SEARCH BOX
  //=========
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/store/?query=${query}` : "/store");
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //========
  //SIGN OUT
  //========
  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("!userInfo" && "cartItems");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("shipmentData");
    window.location.href = "/login";
  };

  return (
    <div>
      <section className="search">
        <div className="container c_flex search_bar">
          <div className="logo width">
            <Link to="/">
              <img src={logo} alt="" className="logo_img" />
            </Link>
          </div>
          <form
            action=""
            onSubmit={submitHandler}
            className="search-box f_flex"
          >
            <i className="fa fa-search" onClick={submitHandler}></i>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search and hit enter..."
            />
            <span>All Category</span>
          </form>
          <div className="icon f_flex width">
            <div className="user_modal">
              <i className="fa fa-user icon-circle" onClick={handleClick}></i>
              <StyledMenu
                darkMode={darkMode}
                id="demo-customized-menu"
                MenuListProps={{
                  "aria-labelledby": "demo-customized-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                {userInfo
                  ? [
                      <MenuItem
                        key="profile"
                        component={Link}
                        to={`/user-profile/${userInfo._id}`}
                        onClick={handleClose}
                        disableRipple
                      >
                        Profile
                      </MenuItem>,
                      <MenuItem
                        key="orders"
                        component={Link}
                        to="/track-order"
                        onClick={handleClose}
                        disableRipple
                      >
                        Orders
                      </MenuItem>,
                      <MenuItem
                        key="wish-list"
                        component={Link}
                        to={`/wish-list/${userInfo._id}`}
                        onClick={handleClose}
                        disableRipple
                      >
                        Wish List
                      </MenuItem>,
                      <StyledDivider darkMode={darkMode} />,
                    ]
                  : null}

                {userInfo && userInfo.isAdmin
                  ? [
                      <MenuItem
                        key="dashboard"
                        component={Link}
                        to="/admin/dashboard"
                        onClick={handleClose}
                        disableRipple
                      >
                        Dashboard
                      </MenuItem>,
                      <MenuItem
                        key="products"
                        component={Link}
                        to="/admin/products"
                        onClick={handleClose}
                        disableRipple
                      >
                        Products
                      </MenuItem>,
                      <MenuItem
                        key="users"
                        component={Link}
                        to="/admin/users"
                        onClick={handleClose}
                        disableRipple
                      >
                        Users
                      </MenuItem>,
                      <MenuItem
                        key="vendors"
                        component={Link}
                        to="/admin/vendors"
                        onClick={handleClose}
                        disableRipple
                      >
                        Vendors
                      </MenuItem>,
                      <MenuItem
                        key="admin-orders"
                        component={Link}
                        to="/admin/orders"
                        onClick={handleClose}
                        disableRipple
                      >
                        Orders
                      </MenuItem>,
                      <MenuItem
                        key="admin-withdrawal-request"
                        component={Link}
                        to="/admin/withdrawal-request"
                        onClick={handleClose}
                        disableRipple
                      >
                        Withdrawals
                      </MenuItem>,
                      <MenuItem
                        key="settings"
                        component={Link}
                        to={`/admin/settings`}
                        onClick={handleClose}
                        disableRipple
                      >
                        Settings
                      </MenuItem>,
                      <StyledDivider darkMode={darkMode} />,
                    ]
                  : null}

                {userInfo && userInfo.isSeller
                  ? [
                      <MenuItem
                        key="dashboard"
                        component={Link}
                        to="/vendor/dashboard"
                        onClick={handleClose}
                        disableRipple
                      >
                        Dashboard
                      </MenuItem>,
                      <MenuItem
                        key="products"
                        component={Link}
                        to="/vendor/products"
                        onClick={handleClose}
                        disableRipple
                      >
                        Products
                      </MenuItem>,
                      <MenuItem
                        key="seller-orders"
                        component={Link}
                        to="/vendor/orders"
                        onClick={handleClose}
                        disableRipple
                      >
                        Orders
                      </MenuItem>,
                      <StyledDivider darkMode={darkMode} />,
                    ]
                  : null}

                {userInfo ? (
                  <MenuItem key="logout" onClick={signoutHandler} disableRipple>
                    Log out
                  </MenuItem>
                ) : (
                  <MenuItem
                    key="login"
                    component={Link}
                    to="/login"
                    onClick={handleClose}
                    disableRipple
                  >
                    Log in
                  </MenuItem>
                )}
              </StyledMenu>
            </div>
            <div className="cart">
              <Link to="/cart">
                <i className="fa fa-shopping-bag icon-circle"></i>
                <span>{cart.cartItems.length}</span>
              </Link>
            </div>
            <div className="menu_bar">
              <i className="fa-solid fa-menu">
                {" "}
                <SideBar />
              </i>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Search;
