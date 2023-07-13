import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ContextProvider } from "./context/Context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { I18nextProvider } from "react-i18next";
import i18next from "./components/utilities/translate/i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId =
  "408401850346-97mfn7e1q7f698pn7in837hha576nleb.apps.googleusercontent.com";

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
            <GoogleOAuthProvider
              clientId={`408401850346-97mfn7e1q7f698pn7in837hha576nleb.apps.googleusercontent.com`}
            >
              <App />
            </GoogleOAuthProvider>
          </I18nextProvider>
        </PayPalScriptProvider>
      </ContextProvider>
    </HelmetProvider>
  </React.StrictMode>
);
