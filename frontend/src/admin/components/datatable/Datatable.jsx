import React from "react";
import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";

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
    status: "pending",
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
    status: "pending",
    email: "admin@example.com",
    age: null,
  },
  {
    id: 6,
    name: "Melisandre",

    img: "/images/shops/shops-9.png",
    status: "passive",
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
    status: "passive",
    email: "admin@example.com",
    age: 65,
  },
];

function Datatable() {
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: () => {
        return (
          <div className="cellAction">
            <Link to="/admin/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div className="deleteButton">Delete</div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <DataGrid
        className="datagrid"
        rows={rows}
        columns={columns.concat(actionColumn)}
        pageSize={8}
        rowsPerPageOptions={[8]}
        checkboxSelection
      />
    </div>
  );
}

export default Datatable;
