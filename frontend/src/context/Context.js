import axios from "axios";
import { createContext, useEffect, useReducer, useState } from "react";
import { getError } from "../components/utilities/util/Utils";
import { request } from "../base url/BaseUrl";

export const Context = createContext();

//CartItems Fetching
const initialState = {
  loading: true,
  error: "",

  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,

  cart: {
    shippingAddress: localStorage.getItem("shippingAddress")
      ? JSON.parse(localStorage.getItem("shippingAddress"))
      : {},

    paymentMethod: localStorage.getItem("paymentMethod")
      ? JSON.parse(localStorage.getItem("paymentMethod"))
      : "",

    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    //LIGHT AND DARK MODE
    case "LIGHT":
      return { darkMode: false };
    case "DARK":
      return { darkMode: true };
    case "TOGGLE":
      return { darkMode: !state.darkMode };

    //FETCH SETTINGS
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, settings: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    //FETCH CATEGORY
    case "FETCH_CATEGORY_REQUEST":
      return { ...state, loading: true };
    case "FETCH_CATEGORY_SUCCESS":
      return { ...state, loading: false, categories: action.payload };
    case "FETCH_CATEGORY_FAIL":
      return { ...state, loading: false, error: action.payload };

    //FETCH BRANDS
    case "FETCH_BRAND_REQUEST":
      return { ...state, loading: true };
    case "FETCH_BRAND_SUCCESS":
      return { ...state, loading: false, brands: action.payload };
    case "FETCH_BRAND_FAIL":
      return { ...state, loading: false, error: action.payload };

    //FETCH PRICE
    case "FETCH_PRICE_REQUEST":
      return { ...state, loading: true };
    case "FETCH_PRICE_SUCCESS":
      return { ...state, loading: false, prices: action.payload };
    case "FETCH_PRICE_FAIL":
      return { ...state, loading: false, error: action.payload };

    //FETCH SIZES
    case "FETCH_SIZE_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SIZE_SUCCESS":
      return { ...state, loading: false, sizes: action.payload };
    case "FETCH_SIZE_FAIL":
      return { ...state, loading: false, error: action.payload };

    //FETCH COLOR
    case "FETCH_COLOR_REQUEST":
      return { ...state, loadingColor: true };
    case "FETCH_COLOR_SUCCESS":
      return { ...state, loadingColo: false, colors: action.payload };
    case "FETCH_COLOR_FAIL":
      return { ...state, loadingColo: false, errorColor: action.payload };

    //FETCH BANNER
    case "FETCH_BANNER_REQUEST":
      return { ...state, loading: true };
    case "FETCH_BANNER_SUCCESS":
      return { ...state, loading: false, banners: action.payload };
    case "FETCH_BANNER_FAIL":
      return { ...state, loading: false, error: action.payload };

    //ADD TO CART
    case "CART_ADD_ITEM":
      const newItem = action.payload;

      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );

      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };

    //REMOVE FROM CART
    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, error: "", cart: { ...state.cart, cartItems } };
    }

    //CART CLEAR
    case "CART_CLEAR":
      return { ...state, error: "", cart: { ...state.cart, cartItems: [] } };

    //CART_ADD_ITEM_FAIL
    case "CART_ADD_ITEM_FAIL":
      return { ...state, error: action.payload };

    //SIGN IN & SIGN OUT
    case "USER_SIGNIN":
      return { ...state, userInfo: action.payload };
    case "USER_SIGNOUT":
      return {
        ...state,
        userInfo: null,
        cart: { cartItems: [], shippingAddress: {}, paymentMethod: "" },
      };

    //SHIPPING
    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        cart: { ...state.cart, shippingAddress: action.payload },
      };

    //PAYMENT METHOD
    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };

    default:
      return state;
  }
}

export function ContextProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { settings } = state;
  //==============
  //FETCH SETTINGS HANDLER
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/settings`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL" });
      }
    };

    fetchData();
  }, [dispatch]);

  //==============
  //FETCH ALL CATEGORY
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/category/alphabetic`);
        dispatch({ type: "FETCH_CATEGORY_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_CATEGORY_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  //==============
  //FETCH ALL SIZE
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/size`);
        dispatch({ type: "FETCH_SIZE_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_SIZE_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  //==============
  //FETCH ALL PRICE
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/price`);
        dispatch({ type: "FETCH_PRICE_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_PRICE_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  //==============
  //FETCH ALL COLOR
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/color`);
        dispatch({ type: "FETCH_COLOR_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_COLOR_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  //===============
  //FETCH ALL BRANDS
  //===============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/brand`);
        dispatch({ type: "FETCH_BRAND_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_BRAND_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  //==============
  //FETCH ALL BANNER
  //==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${request}/api/banner`);
        dispatch({ type: "FETCH_BANNER_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_BANNER_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const toggle = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  //==================
  //TEST FOR CONVERSION
  //==================
  const [toCurrency, setToCurrency] = useState(
    localStorage.getItem("toCurrency") || "INR"
  );
  const convertToINR = (price) => {
    // Conversion rate from USD to INR
    const conversionRate = settings
      ?.map((s) => Number(s.rate))
      ?.find((rate) => !isNaN(rate));
    return (price * conversionRate)?.toFixed(2);
  };

  const convertToUSD = (price) => {
    // Conversion rate from INR to USD
    // const conversionRate = 0.013;
    return price?.toFixed(2);
  };

  const formatPrice = (price, grandTotal) => {
    const formatter = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: toCurrency,
      currencyDisplay: "narrowSymbol",
    });

    if (grandTotal) {
      const formattedGrandTotal = formatter.format(grandTotal);
      const formattedPrice = formatter.format(price);

      // Replace the currency symbol in the formatted price with an empty string
      const formattedPriceWithoutSymbol = formattedPrice.replace(
        formattedGrandTotal,
        ""
      );

      // Append the formatted price without the symbol to the formatted grand total
      return formattedGrandTotal + formattedPriceWithoutSymbol;
    } else {
      return formatter.format(price);
    }
  };

  const convertCurrency = (
    price,
    grandTotal,
    itemsPrice,
    shippingPrice,
    taxPrice,
    sales
  ) => {
    const numericPrice =
      typeof price === "string"
        ? Number(price.replace(/[^0-9.-]+/g, ""))
        : price;

    if (toCurrency === "INR") {
      const convertedPrice = convertToINR(numericPrice, grandTotal);
      const convertedItemsPrice = convertToINR(itemsPrice, grandTotal);
      const convertedShippingPrice = convertToINR(shippingPrice, grandTotal);
      const convertedTaxPrice = convertToINR(taxPrice, grandTotal);
      const convertedSalesPrice = convertToINR(sales, grandTotal);

      return formatPrice(
        convertedPrice,
        grandTotal,
        convertedItemsPrice,
        convertedShippingPrice,
        convertedTaxPrice,
        convertedSalesPrice
      );
    } else if (toCurrency === "USD") {
      const convertedPrice = convertToUSD(numericPrice, grandTotal);
      const convertedItemsPrice = convertToUSD(itemsPrice, grandTotal);
      const convertedShippingPrice = convertToUSD(shippingPrice, grandTotal);
      const convertedTaxPrice = convertToUSD(taxPrice, grandTotal);
      const convertedSalesPrice = convertToUSD(sales, grandTotal);

      return formatPrice(
        convertedPrice,
        grandTotal,
        convertedItemsPrice,
        convertedShippingPrice,
        convertedTaxPrice,
        convertedSalesPrice
      );
    } else {
      return formatPrice(
        price,
        grandTotal,
        itemsPrice,
        shippingPrice,
        taxPrice,
        sales
      );
    }
  };

  useEffect(() => {
    localStorage.setItem("toCurrency", toCurrency);
  }, [toCurrency]);

  const value = {
    state,
    dispatch,
    toCurrency,
    setToCurrency,
    convertCurrency,
    formatPrice,
    darkMode,
    toggle,
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
