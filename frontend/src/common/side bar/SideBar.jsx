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
import { Context } from "../../context/Context";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import WorkIcon from "@mui/icons-material/Work";
import { styled } from "@mui/material/styles";

const StyledDivider = styled(Divider)(({ theme, darkMode }) => ({
  backgroundColor: darkMode ? "#ffffff" : "", // Change colors accordingly
}));

function SideBar() {
  const {
    state: states,
    dispatch: ctxDispatch,
    darkMode,
    toggle,
    currencies,
    toCurrencies,
    setToCurrencies,
  } = useContext(Context);
  const { cart, userInfo, settings } = states;

  const { logo } =
    (settings &&
      settings
        .map((s) => ({
          logo: s.logo,
        }))
        .find(() => true)) ||
    {};

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
    localStorage.removeItem("shipmentData");
    window.location.href = "/login";
  };

  const webItemList = [
    {
      text: "Home",
      icon: <HomeIcon />,
      to: "/", // <-- add link targets
    },
    {
      text: "Store",
      icon: <StoreIcon />,
      to: "/store",
    },
    {
      text: "Cart",
      icon: (
        <span>
          <ShoppingCartIcon className="cart_badge_icon" />
          <span className="cart_badge_side l_flex">
            <span className="cart_badge">{cart.cartItems?.length}</span>
          </span>
        </span>
      ),
      to: "/cart",
    },
    {
      text: "Contact",
      icon: <CallIcon />,
      to: "/contact",
    },
  ];

  const userProfileLink = userInfo ? `/user-profile/${userInfo._id}` : "";
  const userWishLink = userInfo ? `/wish-list/${userInfo._id}` : "";
  const userItemList = [
    {
      text: "My Profile",
      icon: <AccountCircleIcon />,
      to: userProfileLink, // <-- add link targets
    },
    {
      text: "Wish List",
      icon: <FavoriteIcon />,
      to: userWishLink,
    },
    {
      text: "Orders",
      icon: <WorkIcon />,
      to: "/track-order",
    },
    {
      text: "Track Orders",
      icon: <PlaceIcon />,
      to: "/track-shipment",
    },
  ];
  const adminItemList = [
    {
      text: "Dashboard",
      icon: <LineStyleIcon />,
      to: "/admin/dashboard", // <-- add link targets
    },
    {
      text: "Products",
      icon: <Inventory2Icon />,
      to: "/admin/products",
    },
    {
      text: "Users",
      icon: <PeopleIcon />,
      to: "/admin/users",
    },
    {
      text: "Vendors",
      icon: <BadgeIcon />,
      to: "/admin/vendors",
    },
    {
      text: "Orders",
      icon: <WarehouseIcon />,
      to: "/admin/orders",
    },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      to: "/admin/settings",
    },
  ];

  const vendorProfileLink = userInfo ? `/vendor-profile/${userInfo._id}` : "";
  const vendorItemlist = [
    {
      text: "Dashboard",
      icon: <LineStyleIcon />,
      to: "/vendor/dashboard", // <-- add link targets
    },
    {
      text: "Vendor Profile",
      icon: <AccountCircleIcon />,
      to: vendorProfileLink, // <-- add link targets
    },
    {
      text: "Products",
      icon: <Inventory2Icon />,
      to: `/vendor/products`,
    },
    {
      text: "Orders",
      icon: <WarehouseIcon />,
      to: "/vendor/orders",
    },
  ];
  const list = (anchor) => (
    <Box
      sx={{
        width: anchor === "top" || anchor === "bottom" ? "auto" : 250,
      }}
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
                {icon && (
                  <ListItemIcon
                    sx={{
                      color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={text}
                  sx={{
                    color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <StyledDivider darkMode={darkMode} />
      <StyledDivider darkMode={darkMode} />
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
                  {icon && (
                    <ListItemIcon
                      sx={{
                        color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                      }}
                    >
                      {icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={text}
                    sx={{
                      color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <List>
          <ListItem disablePadding component={Link} to={`/login`}>
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                }}
              >
                <LoginIcon />
              </ListItemIcon>
              <ListItemText
                primary="Log in"
                sx={{
                  color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      {userInfo && userInfo.isAdmin ? (
        <>
          <StyledDivider darkMode={darkMode} />
          <StyledDivider darkMode={darkMode} />
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
                    {icon && (
                      <ListItemIcon
                        sx={{
                          color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={text}
                      sx={{
                        color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : null}
      {userInfo && userInfo.isSeller ? (
        <>
          <StyledDivider darkMode={darkMode} />
          <StyledDivider darkMode={darkMode} />
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
                    {icon && (
                      <ListItemIcon
                        sx={{
                          color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={text}
                      sx={{
                        color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : null}
      {userInfo && (
        <>
          <StyledDivider darkMode={darkMode} />
          <StyledDivider darkMode={darkMode} />
          <List>
            <ListItem disablePadding onClick={signoutHandler}>
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Log out"
                  sx={{
                    color: darkMode ? "#ffffff" : "#2e2e2e", // Set text color based on darkMode
                  }}
                />
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
            PaperProps={{
              sx: {
                backgroundColor: darkMode ? "rgb(0,0,0,0.8)" : "",
              },
            }}
          >
            <span className="toggle_width">
              <span className="logo_span l_flex">
                <img src={logo} alt="logo" className="logo" />
              </span>
            </span>
            <StyledDivider darkMode={darkMode} />
            <StyledDivider darkMode={darkMode} />
            {list(anchor)}
            <StyledDivider darkMode={darkMode} />
            <StyledDivider darkMode={darkMode} />
            <span
              className={darkMode ? "dark_mode lower_drawer" : "lower_drawer"}
            >
              <span className="toggle_width">
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
              <StyledDivider darkMode={darkMode} />
              <StyledDivider darkMode={darkMode} />
              <div className="currency_state toggle_width a_flex">
                <CurrencyExchangeIcon className="currencyExchangeIcon" />
                <select
                  className={darkMode ? "dark_mode" : ""}
                  value={toCurrencies}
                  onChange={(e) => {
                    const selectedCurrency = e.target.value;
                    localStorage.setItem("toCurrencies", selectedCurrency);
                    setToCurrencies(selectedCurrency);
                  }}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} &#160;&#160; {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            </span>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}

export default SideBar;
