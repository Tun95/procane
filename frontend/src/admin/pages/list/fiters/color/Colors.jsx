import React, { useContext, useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../../../../../context/Context";
import { request } from "../../../../../base url/BaseUrl";
import { getError } from "../../../../../components/utilities/util/Utils";
import LoadingBox from "../../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../../components/utilities/message loading/MessageBox";
import ReactTimeAgo from "react-time-ago";
import { DataGrid } from "@mui/x-data-grid";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, colors: action.payload };
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

const columns = [
  { field: "_id", headerName: "ID", width: 220 },
  {
    field: "colors",
    headerName: "Color",
    width: 220,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWrapper img a_flex">
            <img src={params?.row?.color} alt="" className="image" />
            &nbsp;<span>{params?.row?.colorName}</span>
          </div>
        </>
      );
    },
  },
  {
    field: "user",
    headerName: "User",
    width: 250,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthName">{params.row.user?.lastName}</div>{" "}
          <div className="cellWidthName">{params.row.user?.firstName}</div>
        </>
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Date",
    width: 200,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthImg">
            <ReactTimeAgo
              date={Date.parse(params.row.createdAt)}
              locale="en-US"
            />
          </div>
        </>
      );
    },
  },
];
function Colors() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const navigate = useNavigate();

  const [{ loading, error, colors, successDelete }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: "",
      colors: [],
    }
  );

  //==============
  //FETCH ALL COLOR
  //==============
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/color`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete, userInfo]);
  console.log(colors);
  //==============
  //DELETE HANDLER
  //==============
  const deleteHandler = async (color) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`${request}/api/color/${color._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success(" Deleted successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "DELETE_SUCCESS", _id: color._id });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction table c_flex">
            <Link to={`/admin/color/${params.row._id}`}>
              <div className="tableBtn">Details</div>
            </Link>
            <div
              onClick={() => deleteHandler(params.row)}
              className="deleteButton"
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const customTranslations = {
    noRowsLabel: "No color found", // Customize the "No Rows" message here
  };
  return (
    <div className="filters">
      <div className="datatable mtb filters">
        <span className="c_flex">
          <h2>All Color</h2>
          <i
            onClick={() => {
              navigate(`/admin/new-color`);
            }}
            className="fa-solid fa-square-plus filters_plus filterPlus"
          ></i>
        </span>
        {loading || successDelete ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <DataGrid
            className="datagrid"
            rows={colors}
            getRowId={(row) => row._id}
            localeText={customTranslations}
            columns={columns.concat(actionColumn)}
            autoPageSize
            rowsPerPageOptions={[5]}
            checkboxSelection
          />
        )}
      </div>
    </div>
  );
}

export default Colors;
