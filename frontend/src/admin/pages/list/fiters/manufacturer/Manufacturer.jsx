import React, { useReducer } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import shop1 from "../../../../assets/images/shops/shops-1.png";
import shop2 from "../../../../assets/images/shops/shops-2.png";
import shop3 from "../../../../assets/images/shops/shops-3.png";
import shop4 from "../../../../assets/images/shops/shops-4.png";
import shop5 from "../../../../assets/images/shops/shops-5.png";
import { request } from "../../../../base url/BaseUrl";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, categories: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, errors: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };
    case "DELETE_RESET":
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
      };

    default:
      return state;
  }
};
function Manufacturers() {
  const navigate = useNavigate();
  const rows = [
    {
      id: 1,
      img: shop1,
      product: "Mapple Earphones",
      amount: "180",
      date: "1 Oct",
      customer: "John Smith",
      method: "Cash on Delivery",
      status: "Approved",
    },
    {
      id: 2,
      img: shop2,
      product: "Vivo android one",
      amount: "120",
      date: "1 Oct",
      customer: "John Smith",
      method: "Cash on Delivery",
      status: "Pending",
    },
    {
      id: 3,
      img: shop3,
      product: "Sony Light",
      amount: 20,
      date: "1 Oct",
      customer: "John Smith",
      method: "Cash on Delivery",
      status: "Declined",
    },
    {
      id: 4,
      img: shop4,
      product: "Iphone",
      amount: 999,
      date: "1 Oct",
      customer: "John Smith",
      method: "Cash on Delivery",
      status: "Pending",
    },
    {
      id: 5,
      img: shop5,
      product: "Ceats wireless earphone",
      date: "1 Oct",
      customer: "John Smith",
      method: "Cash on Delivery",
      status: "Approved",
    },
  ];

  const [{ loading, error, successDelete, categories }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: "",
      posts: [],
    }
  );
  //==============
  //DELETE HANDLER
  //==============
  const deleteHandler = async (category) => {};
  return (
    <div>
      <i
        onClick={() => {
          navigate(`/admin/new-manufacturer`);
        }}
        className="fa-solid fa-square-plus filters_plus filterPlus"
      ></i>
      <TableContainer
        style={{ width: "100%" }}
        component={Paper}
        className="table"
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="tableCell">ID</TableCell>
              <TableCell className="tableCell">Manufacturer</TableCell>
              <TableCell className="tableCell">User</TableCell>
              <TableCell className="tableCell">Date</TableCell>
              <TableCell className="tableCell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="tableCell">{row.id}</TableCell>
                <TableCell className="tableCell">
                  <div className="cellWrapper">
                    <img src={row.img} alt="" className="image" />
                    {row.product}
                  </div>
                </TableCell>
                <TableCell className="tableCell">{row.customer}</TableCell>
                <TableCell className="tableCell">{row.date}</TableCell>
                <TableCell className="tableCell">
                  <Link to={`/category/:id`}>
                    <button className="tableBtn">Details</button>
                  </Link>
                  <button
                    onClick={() => deleteHandler()}
                    className="deleteButton"
                  >
                    Delete
                  </button>{" "}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Manufacturers;
