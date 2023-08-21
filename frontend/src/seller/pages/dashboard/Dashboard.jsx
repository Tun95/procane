import React, { useContext, useEffect, useReducer, useState } from "react";
import Chart from "../../components/chart/Chart";
import { Helmet } from "react-helmet-async";
import Widget from "../../components/widget/Widget";
import { Context } from "../../../context/Context";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { getError } from "../../../components/utilities/util/Utils";
import LoadingBox from "../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../components/utilities/message loading/MessageBox";
import List from "../../components/table/Table";
import "./styles.scss";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
function SellerDashboard() {
  const { state, convertCurrency } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/orders/seller-summary`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        console.log(err);
      }
    };
    fetchData();
  }, [userInfo]);
  console.log(summary);

  //STATS FETCHING
  const [salesStats, setSalesStats] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      summary.last10DaysEarnings
        ?.reverse()
        ?.map((item) =>
          setSalesStats((prev) => [
            ...prev,
            { name: item.date, "Total Sales": item.totalEarningsPerDay },
          ])
        );
    };
    getStats();
  }, [summary.last10DaysEarnings]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom_tooltip" style={{ padding: "10px" }}>
          {/* <p className="label">{label ? `${label}` : ""}</p> */}
          {label ? (
            <p className="label">{`${label}`}</p>
          ) : payload[0]?.date ? (
            <p className="">{`Date: ${payload[0]?.date}`}</p>
          ) : (
            ""
          )}
          <p className="" style={{ color: "#5550bd", marginTop: "3px" }}>
            Total Sales: {`${convertCurrency(payload[0]?.value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const orderNum = summary.totalOrders ? summary?.totalOrders : 0;
  const TotalOrders = orderNum?.toLocaleString("en-GB");

  //TOTAL SALES PER DAY
  const salesTotal = summary.earningsPerDay
    ? summary.earningsPerDay[0]?.totalEarningsPerDay.toFixed(0)
    : 0;
  const TotalSales = convertCurrency(salesTotal);

  //TOTAL SALES PER DAY
  const grandTotal = summary.grandTotalEarnings
    ? summary.grandTotalEarnings?.toFixed(0)
    : 0;
  const GrandTotalSales = convertCurrency(grandTotal);

  console.log(salesStats);
  return (
    <>
      <Helmet>
        <title>Seller's Dashboard</title>
      </Helmet>

      <div className="home dashboard container s_flex">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <div className="widgets ">
              <Widget TotalOrders={TotalOrders} type="order" />
              <Widget TotalSales={TotalSales} type="income" />
              <Widget GrandTotalSales={GrandTotalSales} type="balance" />
            </div>
            <div className="charts">
              <Chart
                title="Last 10 Days (Revenue)"
                data={salesStats}
                grid
                CustomTooltip={CustomTooltip}
                dataKey="Total Sales"
                aspect={3 / 1}
              />
            </div>
            <div className="listContainer">
              <div className="listTitle">Latest Transactions</div>
              <List />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default SellerDashboard;
