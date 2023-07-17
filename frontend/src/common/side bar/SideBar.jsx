import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./style.scss";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlaceIcon from "@mui/icons-material/Place";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import CallIcon from "@mui/icons-material/Call";
import LineStyleIcon from "@mui/icons-material/LineStyle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import SettingsIcon from "@mui/icons-material/Settings";
import logo from "../../assets/procane.png";
import { Context } from "../../context/Context";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

function SideBar() {
  const { state: states, dispatch: ctxDispatch } = useContext(Context);
  const { cart, userInfo } = states;
  const { darkMode, toggle, toCurrency, setToCurrency } = useContext(Context);

  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
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
    window.location.href = "/login";
  };

  const webItemList = [
    {
      text: "",
      icon: <img src={logo} alt="logo" style={{ width: "220px" }} />,
      to: "/", // <-- add link targets
    },
    {
      text: "Home",
      icon: <HomeIcon style={{ fill: "black" }} />,
      to: "/", // <-- add link targets
    },
    {
      text: "Store",
      icon: <StoreIcon style={{ fill: "black" }} />,
      to: "/store",
    },
    {
      text: "Cart",
      icon: (
        <span>
          <ShoppingCartIcon
            style={{ fill: "black" }}
            className="cart_badge_icon"
          />
          <span className="cart_badge_side l_flex">
            <span className="cart_badge">{cart.cartItems?.length}</span>
          </span>
        </span>
      ),
      to: "/cart",
    },
    {
      text: "Contact",
      icon: <CallIcon style={{ fill: "black" }} />,
      to: "/contact",
    },
  ];

  const userProfileLink = userInfo ? `/user-profile/${userInfo._id}` : "";
  const userWishLink = userInfo ? `/wish-list/${userInfo._id}` : "";
  const userItemList = [
    {
      text: "My Profile",
      icon: <AccountCircleIcon style={{ fill: "black" }} />,
      to: userProfileLink, // <-- add link targets
    },
    {
      text: "Wish List",
      icon: <FavoriteIcon style={{ fill: "black" }} />,
      to: userWishLink,
    },
    {
      text: "Track Orders",
      icon: <PlaceIcon style={{ fill: "black" }} />,
      to: "/track-order",
    },
  ];
  const adminItemList = [
    {
      text: "Dashboard",
      icon: <LineStyleIcon style={{ fill: "black" }} />,
      to: "/admin/dashboard", // <-- add link targets
    },
    {
      text: "Products",
      icon: <Inventory2Icon style={{ fill: "black" }} />,
      to: "/admin/products",
    },
    {
      text: "Users",
      icon: <PeopleIcon style={{ fill: "black" }} />,
      to: "/admin/users",
    },
    {
      text: "Vendors",
      icon: <BadgeIcon style={{ fill: "black" }} />,
      to: "/admin/vendors",
    },
    {
      text: "Orders",
      icon: <WarehouseIcon style={{ fill: "black" }} />,
      to: "/admin/orders",
    },
    {
      text: "Settings",
      icon: <SettingsIcon style={{ fill: "black" }} />,
      to: "/admin/settings",
    },
  ];

  const vendorProfileLink = userInfo ? `/vendor-profile/${userInfo._id}` : "";
  const vendorItemlist = [
    {
      text: "Vendor Profile",
      icon: <AccountCircleIcon style={{ fill: "black" }} />,
      to: vendorProfileLink, // <-- add link targets
    },
    {
      text: "Products",
      icon: <Inventory2Icon style={{ fill: "black" }} />,
      to: `/vendor/products`,
    },
    {
      text: "Orders",
      icon: <WarehouseIcon style={{ fill: "black" }} />,
      to: "/vendor/orders",
    },
  ];
  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {webItemList?.map((item, index) => {
          const { text, icon } = item;
          return (
            <ListItem disablePadding component={Link} to={item.to} key={index}>
              <ListItemButton>
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Divider />
      {userInfo ? (
        <List>
          {userItemList?.map((item, index) => {
            const { text, icon } = item;
            return (
              <ListItem
                disablePadding
                component={Link}
                to={item.to}
                key={index}
              >
                <ListItemButton>
                  {icon && <ListItemIcon>{icon}</ListItemIcon>}
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <List>
          <ListItem disablePadding component={Link} to={`/login`}>
            <ListItemButton>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Log in" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      {userInfo && userInfo.isAdmin ? (
        <>
          <Divider />
          <Divider />
          <List>
            {adminItemList?.map((item, index) => {
              const { text, icon } = item;
              return (
                <ListItem
                  disablePadding
                  component={Link}
                  to={item.to}
                  key={index}
                >
                  <ListItemButton>
                    {icon && <ListItemIcon>{icon}</ListItemIcon>}
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : null}
      {userInfo && userInfo.isSeller ? (
        <>
          <Divider />
          <Divider />
          <List>
            {vendorItemlist?.map((item, index) => {
              const { text, icon } = item;
              return (
                <ListItem
                  disablePadding
                  component={Link}
                  to={item.to}
                  key={index}
                >
                  <ListItemButton>
                    {icon && <ListItemIcon>{icon}</ListItemIcon>}
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : null}
      {userInfo && (
        <>
          <Divider />
          <Divider />
          <List>
            <ListItem disablePadding onClick={signoutHandler}>
              <ListItemButton>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Log out" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <div>
      {["right"]?.map((anchor, index) => (
        <React.Fragment key={index}>
          <Button
            className="menu_btn_icon"
            onClick={toggleDrawer(anchor, true)}
          >
            <MenuIcon className="menu_icon" />
          </Button>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            className="side_bar_drawer"
          >
            {list(anchor)}
            <Divider />
            <Divider />
            <span className="toogle_width">
              {darkMode === false && (
                <Button className="toggle_btn" onClick={toggle}>
                  <LightModeIcon /> Light
                </Button>
              )}
              {darkMode === true && (
                <Button className="toggle_btn" onClick={toggle}>
                  <DarkModeIcon /> Dark
                </Button>
              )}
            </span>
            <Divider />
            <Divider />
            <div className="currency_state toogle_width a_flex">
              {/* <label className="to">To:</label> */}
              <CurrencyExchangeIcon className="currencyExchangeIcon" />
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                <option value="USD">$ USD</option>
                <option value="INR">₹ INR</option>
                <option value="NGN">₦ NGN</option>
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}

export default SideBar;
