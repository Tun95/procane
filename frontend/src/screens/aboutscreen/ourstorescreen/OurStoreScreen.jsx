import React from "react";
import OurStores from "../../../components/about/our stores/OurStores";
import { Helmet } from "react-helmet-async";

function OurStoreScreen() {
  return (
    <div>
      <Helmet>
        <title>Our Stores</title>
      </Helmet>
      <OurStores />
    </div>
  );
}

export default OurStoreScreen;
