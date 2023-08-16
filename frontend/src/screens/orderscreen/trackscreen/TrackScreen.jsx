import React from "react";
import Track from "../../../components/orders/trackorder/Track";
import "./styles.scss";

function TrackScreen() {
  return (
    <div className="mtb track_shipment">
      <div className="container ">
        <div className="profile  box_shadow ">
          <h2>Track Order</h2>
          <Track />
        </div>
      </div>
    </div>
  );
}

export default TrackScreen;
