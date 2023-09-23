import React, { useContext, useEffect } from "react";
import "./styles.scss";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ApiKey from "../../single/api/ApiKey";
import Returns from "../../single/about/Returns";
import Bulk from "../../single/about/Bulk";
import OurCares from "../../single/about/OurCare";
import OurStores from "../../single/about/OurStore";
import Privacy from "../../single/about/Privacy";
import Terms from "../../single/about/Terms";
import Careers from "../../single/about/Careers";
import BuyInfo from "../../single/about/BuyInfo";
import ThemeFaq from "../../single/about/ThemeFaq";
import Settings from "../../single/main/Settings";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0, ml: 0.5 }}>
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
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function SettingsScreen() {
  const [value, setValue] = React.useState(0);
  const localStorageKey = "selectedMiniTabValue";

  useEffect(() => {
    const storedValue = localStorage.getItem(localStorageKey);
    if (storedValue) {
      setValue(parseInt(storedValue, 10)); // Parse the value to an integer
    }
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    localStorage.setItem(localStorageKey, newValue.toString()); // Convert to string before saving
  };

  return (
    <div className="settings_screen">
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          width: "100%",
          padding: "0",
          margin: "0",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          style={{ width: "150px", height: "300px" }}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab
            className={value === 0 ? "activeTab" : "tab_sub"}
            label="Settings"
            {...a11yProps(0)}
          />
          <Tab
            className={value === 1 ? "activeTab" : "tab_sub"}
            label="Api & Keys"
            {...a11yProps(1)}
          />
          <Tab
            className={value === 2 ? "activeTab" : "tab_sub"}
            label="Returns"
            {...a11yProps(2)}
          />
          <Tab
            className={value === 3 ? "activeTab" : "tab_sub"}
            label="Our Stores"
            {...a11yProps(3)}
          />
          <Tab
            className={value === 4 ? "activeTab" : "tab_sub"}
            label="Careers"
            {...a11yProps(4)}
          />
          <Tab
            className={value === 5 ? "activeTab" : "tab_sub"}
            label="Our Cares"
            {...a11yProps(5)}
          />
          <Tab
            className={value === 6 ? "activeTab" : "tab_sub"}
            label="Bulk Purchasing"
            {...a11yProps(6)}
          />
          <Tab
            className={value === 7 ? "activeTab" : "tab_sub"}
            label="Terms & Conditions"
            {...a11yProps(7)}
          />{" "}
          <Tab
            className={value === 8 ? "activeTab" : "tab_sub"}
            label="Privacy Policy"
            {...a11yProps(8)}
          />
          <Tab
            className={value === 9 ? "activeTab" : "tab_sub"}
            label="Buy Info"
            {...a11yProps(9)}
          />{" "}
          <Tab
            className={value === 10 ? "activeTab" : "tab_sub"}
            label="Theme Faq"
            {...a11yProps(10)}
          />
        </Tabs>
        <TabPanel className="tabPanel" value={value} index={0}>
          <Settings />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={1}>
          <ApiKey />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={2}>
          <Returns />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={3}>
          <OurStores />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={4}>
          <Careers />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={5}>
          <OurCares />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={6}>
          <Bulk />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={7}>
          <Terms />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={8}>
          <Privacy />
        </TabPanel>
        <TabPanel className="tabPanel" value={value} index={9}>
          <BuyInfo />
        </TabPanel>{" "}
        <TabPanel className="tabPanel" value={value} index={10}>
          <ThemeFaq />
        </TabPanel>
      </Box>
    </div>
  );
}

export default SettingsScreen;
