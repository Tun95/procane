import React from "react";
import Careers from "../../../components/about/careers/Careers";
import { Helmet } from "react-helmet-async";

function CareerScreen() {
  return (
    <div>
      <Helmet>
        <title>Careers</title>
      </Helmet>
      <Careers />
    </div>
  );
}

export default CareerScreen;
