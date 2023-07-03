import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ContextProvider } from "./context/Context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { I18nextProvider } from "react-i18next";
import i18next from "./components/utilities/translate/i18n";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ContextProvider>
        <PayPalScriptProvider
          deferLoading={true}
          options={{ components: "buttons" }}
        >
          <I18nextProvider i18next={i18next}>
            <App />
          </I18nextProvider>
        </PayPalScriptProvider>
      </ContextProvider>
    </HelmetProvider>
  </React.StrictMode>
);
