import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { request } from "../../../../base url/BaseUrl";
import "./styles.scss";

const WrapperComponent = () => {
  // State to hold the list of wrappers and the form data
  const [wrappers, setWrappers] = useState([]);
  const [formData, setFormData] = useState({
    icon: "",
    header: "",
    description: "",
  });

  useEffect(() => {
    // Fetch the list of wrappers when the component mounts
    fetchWrappers();
  }, []);

  // Function to fetch the list of wrappers from the server
  const fetchWrappers = async () => {
    try {
      const response = await axios.get(`${request}/api/wrappers`);
      setWrappers(response.data);
    } catch (error) {
      toast.error("Failed to fetch wrappers");
    }
  };

  // Function to handle changes in the form input fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to add a new wrapper
  const addWrapper = async () => {
    try {
      const response = await axios.post(`${request}/api/wrappers`, formData);
      setWrappers((prevWrappers) => [...prevWrappers, response.data]);
      toast.success("Wrapper added successfully");
    } catch (error) {
      toast.error("Failed to add wrapper");
    }
  };

  // Function to handle editing a wrapper
  const editWrapper = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      _id: id, // Set the _id to indicate it's an existing wrapper
    }));
    populateFormData(id); // Populate the form data with the selected wrapper's details
  };

  const populateFormData = (id) => {
    // Find the selected wrapper by its ID
    const selectedWrapper = wrappers.find(
      (wrapperData) => wrapperData._id === id
    );

    if (selectedWrapper) {
      setFormData((prevData) => ({
        ...prevData,
        icon: selectedWrapper.wrappers[0].icon,
        header: selectedWrapper.wrappers[0].header,
        description: selectedWrapper.wrappers[0].description,
      }));
    } else {
      toast.error("No data found for the wrapper being edited.");
    }
  };

  // Function to delete a wrapper
  const deleteWrapper = async (id) => {
    try {
      await axios.delete(`${request}/api/wrappers/${id}`);
      setWrappers((prevWrappers) =>
        prevWrappers.filter((wrapper) => wrapper._id !== id)
      );
      toast.success("Wrapper deleted successfully");
    } catch (error) {
      toast.error("Failed to delete wrapper");
    }
  };

  // Function to update an existing wrapper
  const updateWrapper = async (id, updatedData) => {
    try {
      const response = await axios.put(
        `${request}/api/wrappers/${id}`,
        updatedData
      );
      return response.data; // Return the updated data from the server
    } catch (error) {
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

  const updateOrAddWrapper = async () => {
    if (formData._id) {
      try {
        // Call updateWrapper function with the correct wrapper ID and the updated data
        const updatedData = {
          icon: formData.icon,
          header: formData.header,
          description: formData.description,
        };
        const updatedWrapper = await updateWrapper(formData._id, updatedData);

        // Update the state directly with the updated data from the server
        setWrappers((prevWrappers) =>
          prevWrappers.map((wrapper) =>
            wrapper._id === formData._id ? updatedWrapper : wrapper
          )
        );

        toast.success("Wrapper updated successfully");
      } catch (error) {
        console.error("Error updating wrapper:", error); // Log the error
        toast.error("Failed to update wrapper");
      }
    } else {
      addWrapper(); // If no _id exists, it's a new wrapper, so call addWrapper function
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form submission
    updateOrAddWrapper();
    // Clear form data after submitting
    setFormData({
      icon: "",
      header: "",
      description: "",
      _id: "", // Clear the _id field to indicate it's a new wrapper
    });
  };

  // Function to handle editing cancellation
  const handleCancelEdit = () => {
    setFormData({
      icon: "",
      header: "",
      description: "",
      _id: "", // Clear the _id field to indicate it's a new wrapper
    });
  };

  return (
    <div className="home_wrappers">
      <div className="light_shadow">
        <h2>Wrappers</h2>
        <form onSubmit={handleSubmit} className="form_input">
          {/* Icon Input */}
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            placeholder="Icon"
          />

          {/* Header Input */}
          <input
            type="text"
            name="header"
            value={formData.header}
            onChange={handleInputChange}
            placeholder="Header"
          />

          {/* Description Input */}
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
          />

          {/* Conditional Rendering of the Buttons */}
          <button type="submit">
            {formData._id ? "Update Wrapper" : "Add Wrapper"}
          </button>
          {formData._id && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>

        <ul className="wrapper_list">
          {wrappers?.map((wrapperData) => (
            <li key={wrapperData._id}>
              {wrapperData.wrappers.map((wrapper) => (
                <div key={wrapper._id}>
                  <div>
                    <strong>icon: </strong>
                    <span>{wrapper.icon}</span>
                  </div>
                  <div>
                    <strong>header: </strong>
                    <span>{wrapper.header}</span>
                  </div>
                  <div>
                    <strong>description: </strong>
                    <span>{wrapper.description}</span>
                  </div>
                </div>
              ))}
              <button
                type="submit"
                onClick={() => editWrapper(wrapperData._id)}
              >
                Edit
              </button>
              &#160; &#160;
              <button
                type="button"
                onClick={() => deleteWrapper(wrapperData._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WrapperComponent;
