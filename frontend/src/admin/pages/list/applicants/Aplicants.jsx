import React, { useContext, useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import axios from "axios";
import ReactTimeAgo from "react-time-ago";
import { Context } from "../../../../context/Context";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import "./styles.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Helmet } from "react-helmet-async";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, applications: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, errors: action.payload };

    case "DECLINE_REQUEST":
      return { ...state, loadingDecline: true, successDecline: false };
    case "DECLINE_SUCCESS":
      return { ...state, loadingDecline: false, successDecline: true };
    case "DECLINE_FAIL":
      return {
        ...state,
        loadingDecline: false,
        successDecline: false,
      };
    case "DECLINE_RESET":
      return {
        ...state,
        loadingDecline: false,
        successDecline: false,
      };

    case "ACCEPT_REQUEST":
      return { ...state, loadingAccept: true, successAccept: false };
    case "ACCEPT_SUCCESS":
      return { ...state, loadingAccept: false, successAccept: true };
    case "ACCEPT_FAIL":
      return {
        ...state,
        loadingAccept: false,
        successAccept: false,
      };
    case "ACCEPT_RESET":
      return {
        ...state,
        loadingAccept: false,
        successAccept: false,
      };

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
  {
    field: "lastName",
    headerName: "Last Name",
    width: 150,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthImg">{params.row.user?.lastName}</div>
        </>
      );
    },
  },
  {
    field: "firstName",
    headerName: "First Name",
    width: 150,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthImg">{params.row.user?.firstName}</div>
        </>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 180,
    renderCell: (params) => {
      return (
        <>
          <div className="cellWidthImg">{params.row.user?.email}</div>
        </>
      );
    },
  },
  { field: "sellerName", headerName: "Store Name", width: 200 },
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
  {
    field: "isSeller",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      if (params.row.status === "approved") {
        return <span className="approved">Approved</span>;
      } else if (params.row.status === "pending") {
        return <span className="pending">Pending</span>;
      } else if (params.row.status === "declined") {
        return <span className="declined">Declined</span>;
      } else {
        return null;
      }
    },
  },
];

function Applicants() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      successDelete,
      successAccept,
      successDecline,
      applications,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
    applications: [],
  });

  //================
  //FETCH ALL PRICE
  //================
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/apply`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDecline || successAccept || successDelete) {
      dispatch({ type: "DECLINE_RESET" });
      dispatch({ type: "ACCEPT_RESET" });
      dispatch({ type: "DELETE_RESET" });
    }

    fetchData();
  }, [successAccept, successDecline, successDelete, userInfo]);

  //==============
  //DECLINE HANDLER
  //==============
  const declineHandler = async (item) => {
    try {
      dispatch({ type: "DECLINE_REQUEST" });
      await axios.put(
        `${request}/api/apply/${item.id}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success("Declined successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "DECLINE_SUCCESS" });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DECLINE_FAIL" });
    }
  };

  //==============
  //ACCEPT HANDLER
  //==============
  const acceptHandler = async (item) => {
    try {
      dispatch({ type: "ACCEPT_REQUEST" });
      await axios.put(
        `${request}/api/apply/${item.id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success("Accepted successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "ACCEPT_SUCCESS" });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "ACCEPT_FAIL" });
    }
  };

  //=================
  //DELETE APPLICANT
  //=================
  const deleteHandler = async (application) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`${request}/api/apply/${application.id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success("Deleted successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  console.log(applications);

  const actionColumn = [
    {
      field: "action",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction c_flex">
            <Link to={`/admin/application-details/${params.row._id}`}>
              <div className="viewButton">Details</div>
            </Link>
            {(params.row.status === "pending" ||
              params.row.status === "approved") && (
              <div
                onClick={() => declineHandler(params.row)}
                className="decline"
              >
                Decline
              </div>
            )}
            {(params.row.status === "pending" ||
              params.row.status === "declined") && (
              <div
                onClick={() => acceptHandler(params.row)}
                className="blockButton"
              >
                Accept
              </div>
            )}
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
    noRowsLabel: "No applicant found", // Customize the "No Rows" message here
  };
  return (
    <>
      <Helmet>
        <title>All Applicants</title>
      </Helmet>
      <div className="applicants">
        <div className="datatable mtb">
          <span className="c_flex">
            <h2>All Applicants</h2>
          </span>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox>{error}</MessageBox>
          ) : (
            <DataGrid
              className="datagrid"
              rows={applications}
              localeText={customTranslations}
              getRowId={(row) => row._id}
              columns={columns.concat(actionColumn)}
              autoPageSize
              rowsPerPageOptions={[8]}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Applicants;
