import React from "react";
import Track from "../../../components/orders/trackorder/Track";

function TrackScreen() {
  return (
    <div className="mtb">
      <div className="container ">
        <div className="profile track_shipment box_shadow ">
          <h2>Track Order</h2>
          <Track />
        </div>
      </div>
    </div>
  );
}

export default TrackScreen;
