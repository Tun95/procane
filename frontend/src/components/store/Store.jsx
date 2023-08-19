import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Filter from "./Filter";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import StoreItems from "./StoreItems";
import "./styles.scss";
import axios from "axios";
import { request } from "../../base url/BaseUrl";
import { getError } from "../utilities/util/Utils";
import { Link, useLocation, useNavigate } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};
function Store() {
  //============
  //PRODUCT FILTER
  //============
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const category = sp.get("category") || "all";
  const query = sp.get("query") || "all";
  const color = sp.get("color") || "all";
  const size = sp.get("size") || "all";
  const price = sp.get("price") || "all";
  const brand = sp.get("brand") || "all";
  const order = sp.get("order") || "all";
  const discount = sp.get("discount") || "all";
  const page = parseInt(sp.get("page") || 1);

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      products: [],
      simProducts: [],
      loading: true,
      error: "",
    });
  //============
  //PRODUCT FETCHING
  //============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(
          `${request}/api/products/store?page=${page}&query=${query}&order=${order}&discount=${discount}&category=${category}&color=${color}&size=${size}&price=${price}&brand=${brand}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        // window.scrollTo(0, 0);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [category, brand, color, size, page, price, query, order, discount]);

  const getFilterUrl = (filter) => {
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterColor = filter.color || color;
    const filterSize = filter.size || size;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    const filterBrand = filter.brand || brand;
    const filterDiscount = filter.discount || discount;
    return `/store?query=${filterQuery}&category=${filterCategory}&order=${sortOrder}&discount=${filterDiscount}&color=${filterColor}&size=${filterSize}&price=${filterPrice}&brand=${filterBrand}`;
  };
  console.log(products);

  // Scroll to the "Store Items" header when the pagination is clicked
  const handlePaginationClick = (event, pageNumber) => {
    const targetElement = document.getElementById("store-items");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  //scroll
  const storeItemsRef = useRef();
  // Function to scroll to the "Store Items" section

  return (
    <>
      <section className="store background" id="store">
        <div className="container ">
          <div className="store_grid">
            <Filter
              products={products}
              brand={brand}
              color={color}
              size={size}
              category={category}
              price={price}
              countProducts={countProducts}
              getFilterUrl={getFilterUrl}
            />

            <div className="contentWidth" ref={storeItemsRef}>
              <div className="heading " id="store-items">
                <div className=" ">
                  <h2>Store Items</h2>
                </div>
              </div>

              <div className="product-content">
                <StoreItems
                  products={products}
                  loading={loading}
                  error={error}
                  dispatch={dispatch}
                />
              </div>
              {countProducts > 6 ? (
                <div className="pagination">
                  <Pagination
                    page={page}
                    count={pages}
                    defaultPage={1}
                    //classes={{ ul: classes.ul }}
                    renderItem={(item) => (
                      <PaginationItem
                        className={`${
                          item.page !== page
                            ? "paginationItemStyle"
                            : "paginationItemStyle active"
                        }`}
                        component={Link}
                        to={`/store?page=${item.page}&query=${query}&category=${category}&color=${color}&size=${size}&price=${price}&brand=${brand}&order=${order}&discount=${discount}`}
                        {...item}
                        onClick={(e) => handlePaginationClick(e, item.page)}
                      />
                    )}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Store;
