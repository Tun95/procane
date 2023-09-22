import React, { useEffect } from "react";
import "./styles.scss";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import SettingsScreen from "../settings/SettingsScreen";
import Subscribers from "../../single/subcribers/Subscribers";
import Applicants from "../../list/applicants/Aplicants";
import { Helmet } from "react-helmet-async";
import { useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Home from "../../single/home/Home";
import Filters from "../../single/filters/Filters";
import Updates from "../../single/updates/Updates";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function OtherScreen() {
  // ==== TAB ===//
  const [value, setValue] = React.useState(0);
  const localStorageKey = "selectedTabValue";

  useEffect(() => {
    const storedValue = localStorage.getItem(localStorageKey);
    if (storedValue) {
      setValue(parseInt(storedValue, 10)); // Parse the value to an integer
    }
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event, newValue) => {
    setValue(newValue);
    localStorage.setItem(localStorageKey, newValue.toString()); // Convert to string before saving
  };

  const handleScrollLeft = () => {
    const tabsWrapper = document.querySelector(".MuiTabs-scroller");
    if (tabsWrapper) {
      // You can customize the scroll distance as needed
      tabsWrapper.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    const tabsWrapper = document.querySelector(".MuiTabs-scroller");
    if (tabsWrapper) {
      // You can customize the scroll distance as needed
      tabsWrapper.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="settings mtb">
      <Helmet>
        <title>All Settings</title>
      </Helmet>
      <div className="container">
        <div className="box_shadow">
          <div className="tab">
            {" "}
            <Box>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  textTransform: "none",
                }}
              >
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant={isSmallScreen ? "scrollable" : "fullWidth"}
                  ScrollButtonComponent={({ direction }) =>
                    direction === "left" ? (
                      <ChevronLeftIcon
                        onClick={handleScrollLeft}
                        className="chevron"
                      />
                    ) : (
                      <ChevronRightIcon
                        onClick={handleScrollRight}
                        className="chevron"
                      />
                    )
                  }
                  className="customTabs"
                  TabIndicatorProps={{
                    className: "customTabIndicator", // Apply the custom class to the TabIndicator
                  }}
                  aria-label="scrollable auto tabs example"
                >
                  <Tab
                    className={value === 0 ? "activeTab" : "tab_sub"}
                    label="General Settings"
                    {...a11yProps(0)}
                  />
                  <Tab
                    className={value === 1 ? "activeTab" : "tab_sub"}
                    label="Home"
                    {...a11yProps(1)}
                  />
                  <Tab
                    className={value === 2 ? "activeTab" : "tab_sub"}
                    label="Filters"
                    {...a11yProps(2)}
                  />
                  <Tab
                    className={value === 3 ? "activeTab" : "tab_sub"}
                    label="Subscribers"
                    {...a11yProps(3)}
                  />
                  <Tab
                    className={value === 4 ? "activeTab" : "tab_sub"}
                    label="Applicants"
                    {...a11yProps(4)}
                  />
                  <Tab
                    className={value === 5 ? "activeTab" : "tab_sub"}
                    label="Updates"
                    {...a11yProps(5)}
                  />
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <SettingsScreen />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Home />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Filters />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <Subscribers />
              </TabPanel>
              <TabPanel value={value} index={4}>
                <Applicants />
              </TabPanel>
              <TabPanel value={value} index={5}>
                <Updates />
              </TabPanel>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtherScreen;
