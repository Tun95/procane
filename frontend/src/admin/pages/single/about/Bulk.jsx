import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { Context } from "../../../../context/Context";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import { request } from "../../../../base url/BaseUrl";
import { toast } from "react-toastify";
import { getError } from "../../../../components/utilities/util/Utils";
import JoditEditor from "jodit-react";

const initialState = {
  loading: false,
  error: null,
  settings: null,
  loadingUpdate: false,
  successUpdate: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, settings: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, successUpdate: true };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPDATE_RESET":
      return {
        ...state,
        loadingUpdate: false,
        successUpdate: false,
      };

    default:
      return state;
  }
};

function Bulk() {
  const editor = useRef(null);
  const { state: contextState } = useContext(Context);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [updatedSettings, setUpdatedSettings] = useState({}); // State to hold updated settings

  //=======
  // FETCH
  //=======
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch({ type: "FETCH_REQUEST" });

      try {
        const response = await axios.get(`${request}/api/settings`);
        const [firstSettings] = response.data; // Extract the first object from the array
        dispatch({ type: "FETCH_SUCCESS", payload: firstSettings });

        // Set the initial values for updatedSettings from the fetched data
        setUpdatedSettings(firstSettings); // Use the extracted object
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: error.message });
      }
    };

    fetchSettings();
  }, []);

  //========
  // UPDATE
  //========
  const handleUpdate = async () => {
    console.log("updatedSettings:", updatedSettings); // Add this line for debugging
    dispatch({ type: "UPDATE_REQUEST" });

    try {
      const response = await axios.put(
        `${request}/api/settings/${updatedSettings._id}`, // Add the _id to the URL
        updatedSettings
      );
      dispatch({ type: "UPDATE_SUCCESS", payload: response.data });
      toast.success("Update successfully", { position: "bottom-center" });
    } catch (error) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(error) });
      toast.error(getError(error), { position: "bottom-center" });
    }
  };
  // Handle editor content changes
  const handleEditorChange = (content) => {
    setUpdatedSettings({ ...updatedSettings, bulk: content });
  };

  return (
    <div className="main_settings new_settings">
      {state.loading ? (
        <LoadingBox></LoadingBox>
      ) : state.error ? (
        <MessageBox variant="danger">{state.error}</MessageBox>
      ) : (
        <>
          {/* Display and edit the settings here */}
          <form className="content_settings light_shadow">
            <div className="lower_form">
              <div>
                <h4>Corporate & Bulk Purchasing:</h4>
                <div className="form_group">
                  <div className="form_box">
                    <JoditEditor
                      className="editor"
                      id="desc"
                      ref={editor}
                      value={updatedSettings.bulk}
                      // config={config}
                      tabIndex={1} // tabIndex of textarea
                      onBlur={(newContent) => handleEditorChange(newContent)}
                      onChange={(newContent) => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <button
            className="btn"
            onClick={handleUpdate}
            disabled={state.loadingUpdate}
          >
            {state.loadingUpdate ? "Updating..." : "Update"}
          </button>
        </>
      )}
    </div>
  );
}

export default Bulk;
