import React from "react";
import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

function Widget({
  type,
  TotalUsers,
  summary,
  TotalOrders,
  TotalSales,
  GrandTotalSales,
  SellersGrandTotalSales,
}) {
  let data;

  //temp
  const amount =
    type === "user"
      ? TotalUsers || 0
      : type === "order"
      ? TotalOrders || 0
      : type === "income"
      ? TotalSales || 0
      : type === "balance"
      ? GrandTotalSales || 0
      : type === "seller"
      ? SellersGrandTotalSales || 0
      : 0;
  const diff = 20;
  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "Number of users",
        icon: (
          <PersonOutlineOutlinedIcon
            className="icon"
            style={{ color: "crimson", backgroundColor: "rgba(255,0,0,0.2)" }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "ORDERS",
        isMoney: false,
        link: "All orders",
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              color: "goldenrod",
              backgroundColor: "rgba(218,165,32,0.2)",
            }}
          />
        ),
      };
      break;
    case "income":
      data = {
        title: "EARNINGS",
        isMoney: true,
        link: "Net earnings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ color: "green", backgroundColor: "rgba(0,128,0,0.2)" }}
          />
        ),
      };
      break;
    case "balance":
      data = {
        title: "BALANCE",
        isMoney: true,
        link: "Total Balance",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{ color: "purple", backgroundColor: "rgba(128,0,128,0.2)" }}
          />
        ),
      };
      break;
    case "seller":
      data = {
        title: "MONTHLY EARNINGS",
        isMoney: true,
        link: "Total Balance",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{ color: "purple", backgroundColor: "rgba(128,0,128,0.2)" }}
          />
        ),
      };
      break;
    default:
      break;
  }
  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney} {amount}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          {/* <KeyboardArrowUpIcon /> */}
          {/* {diff} % */}
        </div>
        {data.icon}
      </div>
    </div>
  );
}

export default Widget;
