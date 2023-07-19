import React from "react";
import "./styles.scss";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

import Banners from "../../list/banner/Banners";
import Category from "../../list/fiters/category/Category";
import Brands from "../../list/fiters/brand/Brand";
import Colors from "../../list/fiters/color/Colors";
import Prices from "../../list/fiters/price/Prices";
import Sizes from "../../list/fiters/size/Sizes";
import Settings from "../../single/settings/Settings";
import SettingsScreen from "../settings/SettingsScreen";
import Subscribers from "../../single/subcribers/Subscribers";
import Applicants from "../../list/applicants/Aplicants";
import { Helmet } from "react-helmet-async";

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="mtb">
      <Helmet>
        <title>All Settings</title>
      </Helmet>
      <div className="container">
        <div className="settings box_shadow">
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
                  variant="fullWidth"
                  scrollButtons="auto"
                  TabIndicatorProps={{
                    className: "customTabIndicator", // Apply the custom class to the TabIndicator
                  }}
                  aria-label="scrollable auto tabs example"
                >
                  <Tab
                    className={value === 0 ? "activeTab" : "tab_sub"}
                    label="Settings"
                    {...a11yProps(0)}
                  />
                  <Tab
                    className={value === 1 ? "activeTab" : "tab_sub"}
                    label="Category Filter"
                    {...a11yProps(1)}
                  />
                  <Tab
                    className={value === 2 ? "activeTab" : "tab_sub"}
                    label="Brand Filter"
                    {...a11yProps(2)}
                  />
                  <Tab
                    className={value === 3 ? "activeTab" : "tab_sub"}
                    label="Colors Filter"
                    {...a11yProps(3)}
                  />
                  <Tab
                    className={value === 4 ? "activeTab" : "tab_sub"}
                    label="Size Filter"
                    {...a11yProps(4)}
                  />
                  <Tab
                    className={value === 5 ? "activeTab" : "tab_sub"}
                    label="Banners"
                    {...a11yProps(5)}
                  />
                  <Tab
                    className={value === 6 ? "activeTab" : "tab_sub"}
                    label="Subscribers"
                    {...a11yProps(6)}
                  />
                  <Tab
                    className={value === 7 ? "activeTab" : "tab_sub"}
                    label="Applicants"
                    {...a11yProps(7)}
                  />
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <SettingsScreen />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Category />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Brands />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <Colors />
              </TabPanel>
              <TabPanel value={value} index={4}>
                <Sizes />
              </TabPanel>
              <TabPanel value={value} index={5}>
                <Banners />
              </TabPanel>
              <TabPanel value={value} index={6}>
                <Subscribers />
              </TabPanel>
              <TabPanel value={value} index={7}>
                <Applicants />
              </TabPanel>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtherScreen;
