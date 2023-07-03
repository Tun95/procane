import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.scss";
import { Helmet } from "react-helmet-async";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthImg">
            <img src={params.row.img} alt="" className="cellImg" />
            {params.row.name}
          </div>
        </>
      );
    },
  },
  { field: "email", headerName: "Email", width: 230 },
  { field: "age", headerName: "Age", width: 100 },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <>
          <div className={`cellWithStatus ${params.row.status}`}>
            {params.row.status}
          </div>
        </>
      );
    },
  },
];

const rows = [
  {
    id: 1,
    name: "Snow",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 35,
  },
  {
    id: 2,
    name: "Lannister",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 42,
  },
  {
    id: 3,
    name: "Lannister",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 45,
  },
  {
    id: 4,
    name: "Stark",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 16,
  },
  {
    id: 5,
    name: "Targaryen",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: null,
  },
  {
    id: 6,
    name: "Melisandre",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 150,
  },
  {
    id: 7,
    name: "Clifford",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 44,
  },
  {
    id: 8,
    name: "Frances",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 36,
  },
  {
    id: 9,
    name: "Roxie",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 65,
  },
  {
    id: 10,
    name: "Snow",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 35,
  },
  {
    id: 11,
    name: "Snow",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 35,
  },
  {
    id: 12,
    name: "Lannister",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 42,
  },
  {
    id: 13,
    name: "Lannister",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 45,
  },
  {
    id: 14,
    name: "Stark",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 16,
  },
  {
    id: 15,
    name: "Targaryen",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: null,
  },
  {
    id: 16,
    name: "Melisandre",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 150,
  },
  {
    id: 17,
    name: "Clifford",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 44,
  },
  {
    id: 18,
    name: "Frances",

    img: "/images/shops/shops-9.png",
    status: "active",
    email: "admin@example.com",
    age: 36,
  },
  {
    id: 19,
    name: "Roxie",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 65,
  },
  {
    id: 20,
    name: "Roxie",

    img: "/images/shops/shops-9.png",
    status: "blocked",
    email: "admin@example.com",
    age: 65,
  },
];

function VendorList() {
  const navigate = useNavigate();

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (user) => {
        return (
          <div className="cellAction">
            <div className="blockButton">Block</div>
            <div className="blockButton">UnBlock</div>
            <div className="deleteButton">Delete</div>
            <Link to={`/admin/useredit/${user.id}`}>
              <div className="viewButton">View</div>
            </Link>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <Helmet>
        <title>All Vendors</title>
      </Helmet>
      <div className="container">
        <div className="datatable mtb">
          <span className="c_flex">
            <h2>All Vendors</h2>
            <i
              onClick={() => {
                navigate(`/admin/vendor/new`);
              }}
              className="fa-solid fa-square-plus filterPlus"
            ></i>
          </span>
          <DataGrid
            className="datagrid"
            rows={rows}
            columns={columns.concat(actionColumn)}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
          />
        </div>
      </div>
    </>
  );
}

export default VendorList;
