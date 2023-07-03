import React, { useContext, useEffect, useReducer } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { request } from "../../../../base url/BaseUrl";
import { Context } from "../../../../context/Context";
import axios from "axios";
import { getError } from "../../../../components/utilities/util/Utils";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import ReactTimeAgo from "react-time-ago";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, banners: action.payload };
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
function Banners() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, banners, successDelete }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: "",
      banners: [],
    }
  );

  //===============
  //FETCH ALL BANNERS
  //===============
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_CATEGORY_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/banner`, {
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

  //==============
  //DELETE HANDLER
  //==============
  const deleteHandler = async (item) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`${request}/api/banner/${item._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success(" Deleted successfully", {
        position: "bottom-center",
      });
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  return (
    <div>
      {loading || successDelete ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <i
            onClick={() => {
              navigate(`/admin/new-banner`);
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
                  <TableCell className="tableCell">Banners</TableCell>
                  <TableCell className="tableCell">User</TableCell>
                  <TableCell className="tableCell">Date</TableCell>
                  <TableCell className="tableCell">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="tableCell">{item._id}</TableCell>
                    <TableCell className="tableCell">
                      <div className="cellWrapper">
                        <img src={item.background} alt="" className="image banner_list_img" />
                        {item.title}
                      </div>
                    </TableCell>
                    <TableCell className="tableCell">
                      {item?.user?.firstName} &nbsp; {item?.user?.lastName}
                    </TableCell>
                    <TableCell className="tableCell">
                      {" "}
                      <ReactTimeAgo
                        date={Date.parse(item.createdAt)}
                        locale="en-US"
                      />
                    </TableCell>
                    <TableCell className="tableCell">
                      <Link to={`/admin/banner/${item._id}`}>
                        <button className="tableBtn">Details</button>
                      </Link>
                      <button
                        onClick={() => deleteHandler(item)}
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
        </>
      )}
    </div>
  );
}

export default Banners;
