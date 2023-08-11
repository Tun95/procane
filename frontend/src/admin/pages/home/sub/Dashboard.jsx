import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Chart from "../../../components/chart/Chart";
import Featured from "../../../components/featured/Featured";
import Table from "../../../components/table/Table";
import Widget from "../../../components/widget/Widget";
import "./styles.scss";
import axios from "axios";
import { getError } from "../../../../components/utilities/util/Utils";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../context/Context";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import { request } from "../../../../base url/BaseUrl";

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
function Dashboard() {
  const navigate = useNavigate();

  const { state, convertCurrency, toCurrencies } = useContext(Context);
  const { userInfo, settings } = state;

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/orders/summary`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        console.log(err);
      }
    };
    fetchData();
  }, [userInfo]);

  //STATS FETCHING
  const [salesStats, setSalesStats] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      summary.dailyOrders
        ?.reverse()
        ?.map((item) =>
          setSalesStats((prev) => [
            ...prev,
            { name: item._id, "Total Sales": item.sales },
          ])
        );
    };
    getStats();
  }, [summary.dailyOrders]);

  // const CustomTooltip = ({ active, payload, label }) => {
  //   let TotalSales = new Intl.NumberFormat("en-GB", {
  //     style: "currency",
  //     currency: toCurrencies,
  //   }).format(payload[0]?.value);

  //   //let TotalSales = numeral(payload[0]?.value).format("0,0a");

  //   if (active && payload && payload.length) {
  //     return (
  //       <div className="custom_tooltip" style={{ padding: "10px" }}>
  //         {label ? (
  //           <p className="label">{`${label}`}</p>
  //         ) : payload[0]?.name ? (
  //           <p className="">{`Date: ${payload[0]?.name}`}</p>
  //         ) : (
  //           ""
  //         )}
  //         <p className="" style={{ color: "#5550bd", marginTop: "3px" }}>
  //           Total Sales: {`${convertCurrency(TotalSales)}`}
  //         </p>
  //       </div>
  //     );
  //   }

  //   return null;
  // };
  console.log(salesStats);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom_tooltip" style={{ padding: "10px" }}>
          {/* <p className="label">{label ? `${label}` : ""}</p> */}
          {label ? (
            <p className="label">{`${label}`}</p>
          ) : payload[0]?.name ? (
            <p className="">{`Date: ${payload[0]?.name}`}</p>
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

  // const salesPerc = (
  //   ((summary.income[0]?.sales - summary?.income[1]?.sales) /
  //     summary?.income[1]?.sales) *
  //   100
  // )?.toFixed(0);
  // const salesDifference =
  //   (summary?.income[0]?.sales || 0) - (summary?.income[1]?.sales || 0);
  // const previousSales = summary?.income[1]?.sales || 0;
  // const salesPerc = ((salesDifference / previousSales) * 100)?.toFixed(0);

  //TOTAL USER
  const userNum = summary.users ? summary?.users[0]?.numUsers : 0;
  const TotalUsers = userNum?.toLocaleString("en-GB");

  //TOTAL ORDERS
  const orderNum = summary.orders ? summary?.orders[0]?.numOrders : 0;
  const TotalOrders = orderNum?.toLocaleString("en-GB");

  //TOTAL SALES PER DAY
  const salesTotal = summary.income ? summary.income[0]?.sales.toFixed(0) : 0;
  const TotalSales = convertCurrency(salesTotal);

  //TOTAL SALES PER DAY
  const grandTotal = summary.salePerformance
    ? summary.salePerformance[0]?.sales.toFixed(0)
    : 0;
  const GrandTotalSales = convertCurrency(grandTotal);

  // console.log(summary);
  console.log(summary);
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <div className="home dashboard container s_flex">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <div className="widgets ">
              <Widget TotalUsers={TotalUsers} summary={summary} type="user" />
              <Widget TotalOrders={TotalOrders} type="order" />
              <Widget TotalSales={TotalSales} type="income" />
              <Widget GrandTotalSales={GrandTotalSales} type="balance" />
            </div>
            <div className="charts">
              <Featured
                TotalSales={TotalSales}
                salesStats={salesStats}
                CustomTooltip={CustomTooltip}
              />
              <Chart
                title="Last 10 Days (Revenue)"
                data={salesStats}
                grid
                CustomTooltip={CustomTooltip}
                dataKey="Total Sales"
                aspect={2 / 1}
              />
            </div>
            <div className="listContainer">
              <div className="listTitle">Latest Transactions</div>
              <Table />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
