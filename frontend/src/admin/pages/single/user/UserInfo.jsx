import React, { useContext, useEffect, useReducer, useState } from "react";
import Chart from "../../../components/chart/Chart";
import List from "../../../components/table/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/styles.scss";
import axios from "axios";
import me from "../../../../assets/me.png";
import { Context } from "../../../../context/Context";
import { getError } from "../../../../components/utilities/util/Utils";
import { request } from "../../../../base url/BaseUrl";
import UserOrderList from "./table/Table";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_ORDER_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_ORDER_SUCCESS":
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        error: "",
      };
    case "FETCH_ORDER_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
function UserInfo() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: userId } = params;

  const { state, convertCurrency, toCurrency } = useContext(Context);
  const { userInfo, settings } = state;

  const [{ loading, error, user }, dispatch] = useReducer(reducer, {
    user: [],
    loading: true,
  });

  //FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
    console.log(userId);
  }, [userId, userInfo]);
  console.log(user);

  //STATS FETCHING
  const [userSpending, setuUserSpending] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      user.dailyOrders
        ?.reverse()
        ?.map((item) =>
          setuUserSpending((prev) => [
            ...prev,
            { name: item._id, "Total Sales": item.sales },
          ])
        );
    };
    getStats();
  }, [user.dailyOrders]);

  const CustomTooltip = ({ active, payload, label }) => {
 
    if (active && payload && payload.length) {
      return (
        <div className="custom_tooltip" style={{ padding: "10px" }}>
          <p className="label">{`${label}`}</p>
          <p className="" style={{ color: "#5550bd", marginTop: "3px" }}>
            Total Sales: {`${convertCurrency(payload[0]?.value)}`}
          </p>
        </div>
      );
    }

    return null;
  };
  return (
    <div className="container">
      <div className="utop ">
        <div className="left">
          <div className="editButton">
            <Link to={`/admin/user/${userId}/edit`}>Edit</Link>
          </div>
          <h1 className="title">Information</h1>
          <div className="item">
            <img
              src={user?.user?.image ? user?.user?.image : me}
              alt=""
              className="itemImg"
            />
            <div className="details">
              <h1 className="itemTitle">
                {user?.user?.firstName} {user?.user?.lastName}
              </h1>
              <div className="detailItem">
                <span className="itemKey">Email:</span>
                <span className="itemValue">{user?.user?.email}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Phone:</span>
                <span className="itemValue">{user?.user?.phone}</span>
              </div>{" "}
              <div className="detailItem">
                <span className="itemKey">Address:</span>
                <span className="itemValue">{user?.user?.address}</span>
              </div>{" "}
              <div className="detailItem">
                <span className="itemKey">Country:</span>
                <span className="itemValue">{user?.user?.country}</span>
              </div>
              <div className="detailItem a_flex">
                <span className="itemKey">Status:</span>
                <span className="itemValue">
                  {!user?.user?.isAccountVerified ? (
                    <span className="unverified_account a_flex">
                      unverified account
                    </span>
                  ) : (
                    <span className="verified_account a_flex">
                      verified account
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          <Chart
            aspect={3 / 1}
            data={userSpending}
            CustomTooltip={CustomTooltip}
            grid
            dataKey="Total Sales"
            title="User Spending (Last 10 Days)"
          />
        </div>
      </div>
      <div className="bottom">
        <h1 className="title">Last Transactions</h1>

        <UserOrderList user={user?.user} convertCurrency={convertCurrency} />
      </div>
    </div>
  );
}

export default UserInfo;
