import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ContextProvider } from "./context/Context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { I18nextProvider } from "react-i18next";
import i18next from "./components/utilities/translate/i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ContextProvider>
        <I18nextProvider i18next={i18next}>
          <GoogleOAuthProvider
            clientId={`408401850346-l9a84d4637fd1f5g4c6kbvrf30kehg85.apps.googleusercontent.com`}
          >
            <PayPalScriptProvider
              deferLoading={true}
              options={{ components: "buttons" }}
            >
              <App />
            </PayPalScriptProvider>
          </GoogleOAuthProvider>
        </I18nextProvider>
      </ContextProvider>
    </HelmetProvider>
  </React.StrictMode>
);
