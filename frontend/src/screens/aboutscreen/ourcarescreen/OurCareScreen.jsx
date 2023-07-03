import React from "react";
import OurCares from "../../../components/about/our cares/OurCares";
import { Helmet } from "react-helmet-async";

function OurCareScreen() {
  return (
    <div>
      <Helmet>
        <title>Our Cares</title>
      </Helmet>
      <OurCares />
    </div>
  );
}

export default OurCareScreen;
