import React, { useContext } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";

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
    marginTop: theme.spacing(3),
    height: "400px",
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    backgroundColor: darkMode ? "rgb(0,0,0,0.8)" : "",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "15px",
      // margin: "0px 15px",
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
function Navbar() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch, darkMode } = useContext(Context);
  const { userInfo, categories } = state;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = () => {
    if (!userInfo) {
      toast.error("You need to login first", { position: "bottom-center" });
      navigate(`/login?redirect=/application`);
    } else {
      navigate(`/application`);
    }
  };
  return (
    <div>
      <header className="header">
        <div className="container d_flex">
          <div className="categories ">
            <div className="d_flex ctg_btn" onClick={handleClick}>
              <FormatAlignLeftIcon className="align_left" />
              <h4>
                Categories <i className="fa fa-chevron-down"></i>
              </h4>
            </div>
            {categories?.length > 0 ? (
              <StyledMenu
                darkMode={darkMode}
                id="demo-customized-menu"
                className="demo_customized_menu"
                MenuListProps={{
                  "aria-labelledby": "demo-customized-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                {categories?.map((c, index) => (
                  <MenuItem
                    key={index}
                    component={Link}
                    to={`/store?category=${c.category}`}
                    onClick={handleClose}
                    disableRipple
                  >
                    {c.category}
                  </MenuItem>
                ))}
              </StyledMenu>
            ) : null}
          </div>
          <div className="navlink">
            <ul className="link f_flex capitalize">
              <li>
                <Link to="/">home</Link>
              </li>
              <li>
                <Link to="/store">store</Link>
              </li>
              {userInfo ? (
                <li>
                  <Link to={`/user-profile/${userInfo._id}`}>user account</Link>
                </li>
              ) : null}
              {userInfo && userInfo.isSeller ? (
                <li>
                  <Link to={`/vendor-profile/${userInfo._id}`}>
                    vendor account
                  </Link>
                </li>
              ) : (
                <li>
                  <span className="pointer" onClick={handleOpen}>
                    Become a merchant
                  </span>
                </li>
              )}

              {userInfo && (
                <li>
                  <Link to="/track-shipment">track my order</Link>
                </li>
              )}
              <li>
                <Link to="/contact">contact</Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
