import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import ReactTimeAgo from "react-time-ago";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { request } from "../../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../../components/utilities/util/Utils";
import { Context } from "../../../../context/Context";
import JoditEditor from "jodit-react";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import "./styles.scss";
import { Checkbox, Pagination } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUBSCRIBER_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUBSCRIBER_SUCCESS":
      return { ...state, loading: false, subscribers: action.payload };
    case "FETCH_SUBSCRIBER_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };

    case "SEND_REQUEST":
      return { ...state, loadingSend: true };
    case "SEND_SUCCESS":
      return { ...state, loadingSend: false };
    case "SEND_FAIL":
      return { ...state, loadingSend: false };

    default:
      return state;
  }
};

const columns = [
  { field: "_id", headerName: "ID", width: 420 },
  { field: "email", headerName: "Email", width: 320 },
  {
    field: "createdAt",
    headerName: "Date",
    width: 280,
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
function Subscribers() {
  const editor = useRef(null);

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [
    { loading, error, loadingSend, subscribers, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    subscribers: [],
    loadingSend: false,
    loading: true,
    error: "",
  });

  //=====================
  //FETCH ALL SUBSCRIBERS
  //=====================
  useEffect(() => {
    const fetchData = async () => {
      // dispatch({ type: "FETCH_SUBSCRIBER_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/message`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUBSCRIBER_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_SUBSCRIBER_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete, userInfo]);

  //=================
  //DELETE SUBSCRIBERS
  //=================
  const deleteHandler = async (subscriber) => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`${request}/api/message/${subscriber.id}`, {
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

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  //=====
  //SEND
  //=====
  const submitHandler = async (e) => {
    e.preventDefault();
    // Check if message or subject is empty
    if (!subject || !message) {
      toast.error("Please provide a subject and message", {
        position: "bottom-center",
      });
      return;
    }
    dispatch({ type: "SEND_REQUEST" });
    try {
      const { data } = await axios.post(`${request}/api/message/send`, {
        subject,
        message,
      });
      dispatch({ type: "SEND_SUCCESS", payload: data });
      toast.success("Email sent successfully", { position: "bottom-center" });

      // Clear form fields
      setSubject("");
      setMessage("");
    } catch (err) {
      dispatch({ type: "SEND_FAIL" });
      toast.error(getError(err), { position: "bottom-center" });
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 220,
      renderCell: (subscriber) => {
        return (
          <div className="cellAction">
            <div
              className="deleteButton"
              onClick={() => deleteHandler(subscriber)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const customTranslations = {
    noRowsLabel: "No subscriber found", // Customize the "No Rows" message here
  };
  return (
    <div className="subscribers">
      {loading || successDelete ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <div className="light_shadow">
            <div className="list">
              <h2 className="mb">Subscribers</h2>
              <DataGrid
                className="datagrid"
                rows={subscribers}
                localeText={customTranslations}
                getRowId={(row) => row._id}
                columns={columns.concat(actionColumn)}
                autoPageSize
                rowsPerPageOptions={[8]}
              />
            </div>
          </div>
          <div className="light_shadow">
            <div className="">
              <h2>Send New Letter</h2>
              <form action="" className="settingsForm" onSubmit={submitHandler}>
                <div className="settingsItem">
                  <input
                    type="text"
                    className="input_box"
                    placeholder="Subject e.g new letter"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <div className="form_box">
                    <JoditEditor
                      className="editor"
                      id="desc"
                      ref={editor}
                      value={message}
                      // config={config}
                      tabIndex={1} // tabIndex of textarea
                      onBlur={(newContent) => setMessage(newContent)} // preferred to use only this option to update the content for performance reasons
                      onChange={(newContent) => {}}
                    />
                  </div>{" "}
                  <div className="settings-btn">
                    <button
                      className="sendButton setting-create"
                      disabled={loadingSend}
                    >
                      {loadingSend ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Subscribers;
