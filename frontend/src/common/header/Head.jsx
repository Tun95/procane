import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";

function Head() {
  const { darkMode, state, toggle, currencies, toCurrencies, setToCurrencies } =
    useContext(Context);
  const { settings } = state;

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 50,
    height: 30,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(22px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor:
            theme.palette.mode === darkMode ? "#8796A5 " : "#aab4be dark",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor:
        theme.palette.mode === darkMode ? "#003892 " : "#001e3c ",
      width: 22,
      height: 22,
      marginTop: 2.5,

      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor:
        theme.palette.mode === darkMode ? "#8796A5 " : "#aab4be ",
      borderRadius: 20 / 2,
    },
  }));

  const { email, whatsapp } =
    (settings &&
      settings
        .map((s) => ({
          whatsapp: s.whatsapp,
          email: s.email,
        }))
        .find(() => true)) ||
    {};

  return (
    <div>
      <section className="head">
        <div className="container a_flex head-position">
          <div className="left row ">
            <span>
              <i className="fa fa-phone"></i>
              <label htmlFor="">
                <a href={`tel:${whatsapp}`}>{whatsapp}</a>
              </label>
              <i className="fa fa-envelope"></i>
              <label htmlFor="">
                <a href={`mailto:${email}`}>{email}</a>
              </label>
            </span>
          </div>
          <div className="right row RText topbar">
            <label htmlFor="" className="none_screen">
              <Link to="/theme-faq">Theme FAQ's</Link>
            </label>
            <label htmlFor="" className="none_screen">
              <Link to="/contact">Need Helps</Link>
            </label>
            <span id="display-none">🏳️‍⚧️</span>
            <label htmlFor="" id="display-none">
              EN
            </label>
            <span id="display-none">🏳️‍⚧️</span>
            {/* <div className="currency_state">
              <label className="to">To:</label>
              <select
                value={toCurrencies}
                onChange={(e) => setToCurrencies(e.target.value)}
              >
                <option value="USD">$ USD</option>
                <option value="INR">₹ INR</option>
                <option value="NGN">₦ NGN</option>
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div> */}
            <div className="currency_state">
              <label className="to">To:</label>
              <select
                className={
                  darkMode ? "dark_mode currency_symbol" : "currency_symbol"
                }
                value={toCurrencies}
                onChange={(e) => {
                  const selectedCurrency = e.target.value;
                  localStorage.setItem("toCurrencies", selectedCurrency);
                  setToCurrencies(selectedCurrency);
                }}
              >
                {currencies.map((currency) => (
                  <option
                    className="currency_symbol_option"
                    key={currency.code}
                    value={currency.code}
                  >
                    {currency.symbol} &#160;&#160; {currency.code}
                  </option>
                ))}
              </select>
            </div>
            <FormControlLabel
              onClick={toggle}
              control={<MaterialUISwitch sx={{ m: 1 }} checked={darkMode} />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Head;
