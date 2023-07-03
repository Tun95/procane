import axios from "axios";
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { request } from "../../../../base url/BaseUrl";
import { getError } from "../../../../components/utilities/util/Utils";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import LoadingBox from "../../../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../../../components/utilities/message loading/MessageBox";
import { Helmet } from "react-helmet-async";
import JoditEditor from "jodit-react";
import "./styles.scss";
import { Context } from "../../../../context/Context";

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
      return { ...state, loadingUpdate: false };
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
function Settings() {
  const editor = useRef(null);

  const params = useParams();
  const { id: setId } = params;

  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { userInfo } = state;

  const [{ loading, error, successUpdate, loadingUpdate }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const [about, setAbout] = useState("");
  const [terms, setTerms] = useState("");
  const [returns, setReturns] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [currency, setCurrency] = useState("");
  const [rate, setRate] = useState();
  const [tax, setTax] = useState("");
  const [shipping, setShipping] = useState("");
  const [express, setExpress] = useState("");
  const [expressCharges, setExpressCharges] = useState("");
  const [standard, setStandard] = useState("");
  const [standardCharges, setStandardCharges] = useState("");
  const [messenger, setMessenger] = useState("");
  const [email, setEmail] = useState("");
  const [playstore, setPlayStore] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [appstore, setAppStore] = useState("");
  const [webname, setWebname] = useState("");
  const [bannerBackground, setBannerBackground] = useState("");
  const [buyInfo, setBuyInfo] = useState("");
  const [bulk, setBulk] = useState("");
  const [careers, setCareers] = useState("");
  const [ourstores, setOurStores] = useState("");
  const [ourcares, setOurCares] = useState("");
  const [reviewGuide, setReviewGuide] = useState("");

  //===============
  //FETCH SETTINGS
  //===============
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`${request}/api/settings/${setId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setAbout(data.about);
        setTerms(data.terms);
        setReturns(data.returns);
        setPrivacy(data.privacy);
        setCurrency(data.currency);
        setRate(data.rate);
        setTax(data.tax);
        setShipping(data.shipping);
        setExpress(data.express);
        setExpressCharges(data.expressCharges);
        setStandard(data.standard);
        setStandardCharges(data.standardCharges);
        setMessenger(data.messenger);
        setEmail(data.email);
        setPlayStore(data.playstore);
        setWhatsapp(data.whatsapp);
        setAppStore(data.appstore);
        setWebname(data.webname);
        setBannerBackground(data.bannerBackground);
        setBuyInfo(data.buyInfo);
        setBulk(data.bulk);
        setCareers(data.careers);
        setOurStores(data.ourstores);
        setOurCares(data.ourcares);
        setReviewGuide(data.reviewGuide);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        window.scrollTo(0, 0);
      } catch (error) {
        dispatch({ type: "FETCH_FAIL" });
      }
    };
    if (successUpdate) {
      dispatch({ type: "UPDATE_RESET" });
    } else {
      fetchData();
    }
  }, [setId, successUpdate, userInfo]);

  //=================
  // UPDATING SETTINGS
  //=================
  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `${request}/api/settings/${setId}`,
        {
          about,
          terms,
          returns,
          privacy,
          currency,
          rate,
          tax,
          shipping,
          express,
          expressCharges,
          standard,
          standardCharges,
          messenger,
          email,
          playstore,
          whatsapp,
          appstore,
          webname,
          bannerBackground,
          buyInfo,
          bulk,
          careers,
          ourstores,
          ourcares,
          reviewGuide,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Settings updated successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
    }
  };

  //BANNER BACKGROUND
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(`${request}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      toast.success("Image uploaded successfully", {
        position: "bottom-center",
      });
      setBannerBackground(data.secure_url);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };
  return (
    <div className="mtb">
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <div className="main_settings container">
        <div className="box_shadow">
          <>
            {loading || loadingUpdate ? (
              <LoadingBox></LoadingBox>
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : (
              <div className="others new-settings-edit ">
                <div className="other_settings web_container ">
                  <h1>Settings:</h1>
                  <div className="content_settings container_shadow">
                    <form
                      action=""
                      onSubmit={updateHandler}
                      className="inner_form"
                    >
                      <div className="form_group">
                        <div className="form_box">
                          <h3>About:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={about}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setAbout(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Terms and Conditions:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={terms}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setTerms(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Return Policy:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={returns}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setReturns(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Privacy Policy:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={privacy}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setPrivacy(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>How to Buy Guidelines:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={buyInfo}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setBuyInfo(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Review Guidelines:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={reviewGuide}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setReviewGuide(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Corporate & Bulk Purchasing:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={bulk}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setBulk(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>{" "}
                        <div className="form_box">
                          <h3>Careers:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={careers}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setCareers(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>
                        <div className="form_box">
                          <h3>Our Stores:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={ourstores}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setOurStores(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>
                        <div className="form_box">
                          <h3>Our Cares:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={ourcares}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setOurCares(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={(newContent) => {}}
                          />
                        </div>
                      </div>
                      <div className="lower_form">
                        <div>
                          <div className="lower_group">
                            <small>Your Currency Short name:</small>
                            <input
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              type="text"
                              placeholder="currency e.g GBP"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Rate of conversion from USD to INR:</small>
                            <input
                              value={rate}
                              onChange={(e) => setRate(e.target.value)}
                              type="text"
                              placeholder="sign e.g £"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Set your tax percentage:</small>
                            <input
                              value={tax}
                              onChange={(e) => setTax(e.target.value)}
                              type="text"
                              placeholder="tax e.g 14"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Shipping Price:</small>
                            <input
                              value={shipping}
                              onChange={(e) => setShipping(e.target.value)}
                              type="text"
                              placeholder="shipping e.g 20"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Shipping Method &amp; Price:</small>
                            <span className="d_flex">
                              <input
                                className="sub_input"
                                value={express}
                                onChange={(e) => setExpress(e.target.value)}
                                type="text"
                                placeholder="express shipping"
                              />
                              <input
                                className="sub_input"
                                value={expressCharges}
                                onChange={(e) =>
                                  setExpressCharges(e.target.value)
                                }
                                type="text"
                                placeholder="price e.g 20"
                              />
                            </span>
                          </div>
                          <div className="lower_group">
                            <small>Shipping Method &amp; Price:</small>
                            <span className="d_flex">
                              <input
                                className="sub_input"
                                value={standard}
                                onChange={(e) => setStandard(e.target.value)}
                                type="text"
                                placeholder="standard shipping"
                              />
                              <input
                                className="sub_input"
                                value={standardCharges}
                                onChange={(e) =>
                                  setStandardCharges(e.target.value)
                                }
                                type="text"
                                placeholder="price e.g 20"
                              />
                            </span>
                          </div>
                          {/* <div className="background_image">
                        <small>
                          Banner background image here{" "}
                          <small>
                            <strong>(940 x 336)px</strong>
                          </small>
                          :
                        </small>
                        <input
                          type="text"
                          placeholder="banner background"
                          value={bannerBackground}
                          onChange={(e) => setBannerBackground(e.target.value)}
                        />

                        <span>
                          <label htmlFor="file">
                            <i
                              onChange={uploadFileHandler}
                              className="fa-solid fa-arrow-up-from-bracket"
                            ></i>
                          </label>
                          <input
                            onChange={uploadFileHandler}
                            type="file"
                            id="file"
                            style={{ display: "none" }}
                          />
                        </span>
                      </div> */}
                        </div>
                        <div>
                          <div className="lower_group">
                            <small>Your Messanger nick name link here:</small>
                            <input
                              value={messenger}
                              onChange={(e) => setMessenger(e.target.value)}
                              type="text"
                              placeholder="john.stone"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your Email here:</small>
                            <input
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="text"
                              placeholder="admin@gmail.com"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your PlayStore link here:</small>
                            <input
                              value={playstore}
                              onChange={(e) => setPlayStore(e.target.value)}
                              type="text"
                              placeholder="https://playstore.com/"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your WhatSapp number here:</small>
                            <input
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              type="text"
                              placeholder="+123 345 6789"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your AppStore Page link here:</small>
                            <input
                              value={appstore}
                              onChange={(e) => setAppStore(e.target.value)}
                              type="text"
                              placeholder="https://www.appstore.com/"
                            />
                          </div>
                          <div className="lower_group">
                            <h3>Your Website name here:</h3>
                            <input
                              value={webname}
                              onChange={(e) => setWebname(e.target.value)}
                              type="text"
                              placeholder="SHOPMATE"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="submit_btn">
                        <button>Update All</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

export default Settings;
