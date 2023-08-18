import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/system";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
import Slider from "@mui/material/Slider";

const CustomSlider = styled(Slider)(({ theme }) => ({
  // Styles for the thumb
  "& .MuiSlider-thumb": {
    color: "#f62f5e", // Replace with your desired color
  },
  // Styles for the track
  "& .MuiSlider-track": {
    backgroundColor: "#f62f5e",
    border: "2px solid #f62f5e",
    boxShadow: "0px 2px 4px rgba(255, 81, 81, 0.4)", // Replace with your desired color
  },
  // Styles for the background
  "& .MuiSlider-rail": {
    backgroundColor: "#f62f5e", // Replace with your desired color
  },
}));
function valuetext(value) {
  return `${value}°C`;
}
function Filter({
  getFilterUrl,
  brand,
  size,
  color,
  category,
  price,
  countProducts,
}) {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch, convertCurrency } = useContext(Context);
  const { categories, sizes, brands, prices, colors } = state;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 210,
      },
    },
  };

  //=========
  //SEARCH BOX
  //=========
  const [query, setQuery] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/store/?query=${query}` : "/store");
  };

  //============
  //FILTERS
  //===========
  const [selectedCategories, setSelectedCategories] = useState(
    category === "all" ? [] : category.split(",")
  );
  const [selectedSizes, setSelectedSizes] = useState(
    size === "all" ? [] : size.split(",")
  );
  const [selectedColors, setSelectedColors] = useState(
    color === "all" ? [] : color.split(",")
  );
  const [selectedBrands, setSelectedBrands] = useState(
    brand === "all" ? [] : brand.split(",")
  );

  const minDistance = 1000; // Adjust the value as needed

  const [value, setValue] = React.useState([0, 10000]);

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    const clampedValue = [
      Math.max(newValue[0], 0),
      Math.min(newValue[1], 10000),
    ];

    if (clampedValue[1] - clampedValue[0] < minDistance) {
      if (activeThumb === 0) {
        const newMax = Math.min(clampedValue[0] + minDistance, 10000);
        setValue([clampedValue[0], newMax]);
      } else {
        const newMin = Math.max(clampedValue[1] - minDistance, 0);
        setValue([newMin, clampedValue[1]]);
      }
    } else {
      setValue(clampedValue);
    }

    const selectedValues = clampedValue.join("-");
    // Do something with the selectedValues
    navigate(getFilterUrl({ price: selectedValues }));
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setValue([0, 10000]);
    navigate("/store");
  };

  return (
    <>
      <div className="category ">
        <div className="chead d_flex">
          <h1>Filter {countProducts === 0 ? "No" : countProducts} Items</h1>
          <h1>Store</h1>
        </div>
        <div className="filter-med">
          <div className="product_filter ">
            <h4>Search</h4>
            <form
              action=""
              onSubmit={submitHandler}
              className="search-box f_flex"
            >
              <i className="fa fa-search" onClick={submitHandler}></i>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="search_filter"
                placeholder="Search..."
              />
            </form>
          </div>
          <div className="product_filter ">
            <h4>Category</h4>
            <FormControl
              variant="filled"
              size="small"
              className="formControl_width"
            >
              <Select
                labelId="mui-price-select-label"
                id="mui_simple_select"
                value={selectedCategories}
                multiple
                MenuProps={MenuProps}
                SelectDisplayProps={{
                  style: { paddingTop: 8, paddingBottom: 8 },
                }}
                onChange={(e) => {
                  const selectedValues = e.target.value;
                  setSelectedCategories(selectedValues);
                  navigate(getFilterUrl({ category: selectedValues }));
                }}
              >
                {categories?.map((c, index) => (
                  <MenuItem
                    key={index}
                    id="MuiMenuItem-root"
                    value={c.category}
                    disabled={c.disabled}
                  >
                    {c.category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="product_filter ">
            <h4>Color</h4>
            <FormControl
              variant="filled"
              size="small"
              className="formControl_width"
            >
              <Select
                labelId="mui-price-select-label"
                id="mui_simple_select"
                value={selectedColors}
                multiple
                MenuProps={MenuProps}
                SelectDisplayProps={{
                  style: { paddingTop: 8, paddingBottom: 8 },
                }}
                onChange={(e) => {
                  const selectedValues = e.target.value;
                  setSelectedColors(selectedValues);
                  navigate(getFilterUrl({ color: selectedValues }));
                }}
              >
                {colors?.map((c, index) => (
                  <MenuItem
                    key={index}
                    id="MuiMenuItem-root"
                    value={c.color}
                    disabled={c.disabled}
                  >
                    <img
                      src={c.color}
                      alt={c.color}
                      className="color_image_size"
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="product-size product_filter">
            <h4>Size</h4>
            <div className="product-size-btn">
              <FormControl
                variant="filled"
                size="small"
                className="formControl_width"
              >
                <Select
                  labelId="mui-price-select-label"
                  id="mui_simple_select"
                  value={selectedSizes}
                  multiple
                  MenuProps={MenuProps}
                  SelectDisplayProps={{
                    style: { paddingTop: 8, paddingBottom: 8 },
                  }}
                  onChange={(e) => {
                    const selectedValues = e.target.value;
                    setSelectedSizes(selectedValues);
                    navigate(getFilterUrl({ size: selectedValues }));
                  }}
                >
                  {sizes?.map((s, index) => (
                    <MenuItem
                      key={index}
                      id="MuiMenuItem-root"
                      value={s.size}
                      disabled={s.disabled}
                    >
                      {s.size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="price-range product_filter">
            <h4>Price range</h4>
            <div className="middle">
              <FormControl
                variant="filled"
                size="small"
                className="formControl_width"
              >
                <CustomSlider
                  value={value}
                  onChange={handleChange}
                  // valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                  className="mui_slider"
                  min={0}
                  max={10000}
                />
              </FormControl>
              <div className="value_number d_flex">
                <span>{convertCurrency(value[0])}</span>
                <span className="value_two">{convertCurrency(value[1])}</span>
              </div>
            </div>
          </div>
          <div className="brand product_filter">
            <h4>Brand</h4>
            <div className="select-brand">
              <FormControl
                variant="filled"
                size="small"
                className="formControl_width"
              >
                <Select
                  labelId="mui-price-select-label"
                  id="mui_simple_select"
                  value={selectedBrands}
                  multiple
                  MenuProps={MenuProps}
                  SelectDisplayProps={{
                    style: { paddingTop: 8, paddingBottom: 8 },
                  }}
                  onChange={(e) => {
                    const selectedValues = e.target.value;
                    setSelectedBrands(selectedValues);
                    navigate(getFilterUrl({ brand: selectedValues }));
                  }}
                >
                  {brands?.map((b, index) => (
                    <MenuItem key={index} value={b.brand}>
                      {b.brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="box filter_btn" onClick={handleClearAll}>
          <button>Clear All</button>
        </div>
      </div>
    </>
  );
}

export default Filter;
