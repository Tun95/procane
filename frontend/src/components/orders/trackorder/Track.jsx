import axios from 'axios';
import React, { useState } from 'react'

function Track() {
	  const [trackingNumber, setTrackingNumber] = useState("");
    const [address, setAddress] = useState("");
    const [shippingResponse, setShippingResponse] = useState(null);
    const [trackingResponse, setTrackingResponse] = useState(null);
    const [locationResponse, setLocationResponse] = useState(null);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make API request to the server-side endpoint
      const response = await axios.post("/api/shipping", {
        origin: "...",
        destination: "...",
        weight: "...",
      });

      // Handle successful response
      setShippingResponse(response.data);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make API request to the server-side endpoint
      const response = await axios.get(`/api/tracking/${trackingNumber}`);

      // Handle successful response
      setTrackingResponse(response.data);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make API request to the server-side endpoint
      const response = await axios.get(`/api/location/${address}`);

      // Handle successful response
      setLocationResponse(response.data);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };
	return (
    <div>
      <h2>Shipping API</h2>
      <form onSubmit={handleShippingSubmit}>
        {/* Shipping form fields */}
        <button type="submit">Submit</button>
      </form>

      <h2>Tracking API</h2>
      <form onSubmit={handleTrackingSubmit}>
        {/* Tracking form fields */}
        <button type="submit">Submit</button>
      </form>

      <h2>Location API</h2>
      <form onSubmit={handleLocationSubmit}>
        <input
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Track