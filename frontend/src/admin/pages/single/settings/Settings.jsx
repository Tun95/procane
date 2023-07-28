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
import PublishIcon from "@mui/icons-material/Publish";

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
  const [razorkeyid, setRazorKeyId] = useState("");
  const [razorsecret, setRazorSecret] = useState();
  const [paytmid, setPaytmId] = useState("");
  const [paytmkey, setPaytmKey] = useState("");
  const [paystackkey, setPayStackKey] = useState("");
  const [payUPub, setPayUPub] = useState("");
  const [payUPriv, setPayUPriv] = useState("");
  const [stripeApiKey, setstripeApiKey] = useState("");
  const [stripePubKey, setstripePubKey] = useState("");
  const [exhangerate, setExhangeRate] = useState("");
  const [tax, setTax] = useState("");
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
  const [storeAddress, setStoreAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [buyInfo, setBuyInfo] = useState("");
  const [bulk, setBulk] = useState("");
  const [careers, setCareers] = useState("");
  const [ourstores, setOurStores] = useState("");
  const [ourcares, setOurCares] = useState("");
  const [themeFaq, setThemeFaq] = useState("");
  const [googleAnalytics, setGoogleAnalytics] = useState("");

  const [messengerAppId, setMessengerAppId] = useState("");
  const [messengerPageId, setMessengerPageId] = useState("");

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
        setShortDesc(data.shortDesc);
        setCurrency(data.currency);
        setRazorKeyId(data.razorkeyid);
        setRazorSecret(data.razorsecret);
        setPaytmId(data.paytmid);
        setPaytmKey(data.paytmkey);
        setPayUPriv(data.payUPriv);
        setPayUPub(data.payUPub);
        setPayStackKey(data.paystackkey);
        setstripeApiKey(data.stripeApiKey);
        setstripePubKey(data.stripePubKey);
        setExhangeRate(data.exhangerate);
        setTax(data.tax);
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
        setStoreAddress(data.storeAddress);
        setLogo(data.logo);
        setFaviconUrl(data.faviconUrl);
        setBuyInfo(data.buyInfo);
        setBulk(data.bulk);
        setCareers(data.careers);
        setOurStores(data.ourstores);
        setOurCares(data.ourcares);
        setThemeFaq(data.themeFaq);
        setGoogleAnalytics(data.googleAnalytics);
        setMessengerAppId(data.messengerAppId);
        setMessengerPageId(data.messengerPageId);
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
          razorkeyid,
          razorsecret,
          paytmid,
          paytmkey,
          payUPriv,
          payUPub,
          paystackkey,
          stripeApiKey,
          stripePubKey,
          exhangerate,
          tax,
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
          storeAddress,
          shortDesc,
          logo,
          faviconUrl,

          buyInfo,
          bulk,
          careers,
          ourstores,
          ourcares,
          themeFaq,
          googleAnalytics,
          messengerAppId,
          messengerPageId,
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

  //LOGO UPLOAD
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
      setLogo(data.secure_url);
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  //FAVICON UPLOAD
  const uploadFavHandler = async (e) => {
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
      setFaviconUrl(data.secure_url);
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
                          <h3>Theme FAQ's:</h3>
                          <JoditEditor
                            className="editor"
                            id="desc"
                            ref={editor}
                            value={themeFaq}
                            // config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setThemeFaq(newContent)} // preferred to use only this option to update the content for performance reasons
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
                          <h4>KEYS:</h4>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>RazorPay API Id:</small>
                                <input
                                  className="sub_input"
                                  value={razorkeyid}
                                  onChange={(e) =>
                                    setRazorKeyId(e.target.value)
                                  }
                                  type="text"
                                  placeholder="RazorPay Id"
                                />
                              </span>
                              <span className="flex_row">
                                <small>RazorPay API key:</small>
                                <input
                                  className="sub_input"
                                  value={razorsecret}
                                  onChange={(e) =>
                                    setRazorSecret(e.target.value)
                                  }
                                  type="text"
                                  placeholder="RazorPay secret key"
                                />
                              </span>
                            </span>
                          </div>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>PayTm API Id:</small>
                                <input
                                  className="sub_input"
                                  value={paytmid}
                                  onChange={(e) => setPaytmId(e.target.value)}
                                  type="text"
                                  placeholder="paytm id"
                                />
                              </span>
                              <span className="flex_row">
                                <small>PayTm API Key:</small>
                                <input
                                  className="sub_input"
                                  value={paytmkey}
                                  onChange={(e) => setPaytmKey(e.target.value)}
                                  type="text"
                                  placeholder="paytm key"
                                />
                              </span>
                            </span>
                          </div>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>PayU Public key:</small>
                                <input
                                  className="sub_input"
                                  value={payUPub}
                                  onChange={(e) => setPayUPub(e.target.value)}
                                  type="text"
                                  placeholder="payU key"
                                />
                              </span>
                              <span className="flex_row">
                                <small>PayU Privite Key:</small>
                                <input
                                  className="sub_input"
                                  value={payUPriv}
                                  onChange={(e) => setPayUPriv(e.target.value)}
                                  type="text"
                                  placeholder="payU key"
                                />
                              </span>
                            </span>
                          </div>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>Stripe Secret key:</small>
                                <input
                                  className="sub_input"
                                  value={stripeApiKey}
                                  onChange={(e) =>
                                    setstripeApiKey(e.target.value)
                                  }
                                  type="text"
                                  placeholder="stripe secret"
                                />
                              </span>
                              <span className="flex_row">
                                <small>Stripe Public key:</small>
                                <input
                                  className="sub_input"
                                  value={stripePubKey}
                                  onChange={(e) =>
                                    setstripePubKey(e.target.value)
                                  }
                                  type="text"
                                  placeholder="stripe pub. key"
                                />
                              </span>
                            </span>
                          </div>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>Messenger App Id:</small>
                                <input
                                  className="sub_input"
                                  value={messengerAppId}
                                  onChange={(e) =>
                                    setMessengerAppId(e.target.value)
                                  }
                                  type="text"
                                  placeholder="messenger app id"
                                />
                              </span>
                              <span className="flex_row">
                                <small>Messager Page Id:</small>
                                <input
                                  className="sub_input"
                                  value={messengerPageId}
                                  onChange={(e) =>
                                    setMessengerPageId(e.target.value)
                                  }
                                  type="text"
                                  placeholder="messenger page id"
                                />
                              </span>
                            </span>
                          </div>
                          <div className="lower_group">
                            <small>PayStack API key:</small>
                            <input
                              value={paystackkey}
                              onChange={(e) => setPayStackKey(e.target.value)}
                              type="text"
                              placeholder="api key"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Exhange Rate API key:</small>
                            <input
                              value={exhangerate}
                              onChange={(e) => setExhangeRate(e.target.value)}
                              type="text"
                              placeholder="api key"
                            />
                          </div>
                          {/* <div className="lower_group">
                            <small>Your google analytics Id:</small>
                            <input
                              value={googleAnalytics}
                              onChange={(e) =>
                                setGoogleAnalytics(e.target.value)
                              }
                              type="text"
                              placeholder="google analytics Id"
                            />
                          </div> */}
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
                            <small>Set your default currency:</small>
                            <input
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              type="text"
                              placeholder="tax e.g 14"
                            />
                          </div>

                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>Shipping Method</small>
                                <input
                                  className="sub_input"
                                  value={express}
                                  onChange={(e) => setExpress(e.target.value)}
                                  type="text"
                                  placeholder="express shipping"
                                />
                              </span>
                              <span className="flex_row">
                                <small>Charges</small>
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
                            </span>
                          </div>
                          <div className="lower_group">
                            <span className="d_flex">
                              <span className="flex_row">
                                <small>Shipping Method</small>
                                <input
                                  className="sub_input"
                                  value={standard}
                                  onChange={(e) => setStandard(e.target.value)}
                                  type="text"
                                  placeholder="standard shipping"
                                />
                              </span>
                              <span className="flex_row">
                                <small>Charges</small>
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
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="lower_group">
                            <small>Your Messanger nick name here:</small>
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
                            <h3>Your Store Info here:</h3>
                            <div className="logo_image">
                              <small>favicon:</small>
                              <div className="a_flex">
                                <img
                                  src={faviconUrl}
                                  alt="store logo"
                                  className="logo"
                                />
                                <span>
                                  <label htmlFor="favicon">
                                    <PublishIcon
                                      className="userUpdateIcon upload-btn"
                                      onChange={uploadFavHandler}
                                    />
                                  </label>
                                  <input
                                    onChange={uploadFavHandler}
                                    type="favicon"
                                    id="favicon"
                                    style={{ display: "none" }}
                                  />
                                </span>
                              </div>
                            </div>
                            <small>Your Store name here:</small>
                            <input
                              value={webname}
                              onChange={(e) => setWebname(e.target.value)}
                              type="text"
                              placeholder="ProCanes"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your Store address here:</small>
                            <input
                              value={storeAddress}
                              onChange={(e) => setStoreAddress(e.target.value)}
                              type="text"
                              placeholder="Tanke, oke-odo Nigeria"
                            />
                          </div>
                          <div className="lower_group">
                            <small>Your store short description here:</small>
                            <textarea
                              name="about_store"
                              id="about_store"
                              cols="30"
                              rows="10"
                              className="about_store"
                              value={shortDesc}
                              onChange={(e) => setShortDesc(e.target.value)}
                              placeholder="short store description..."
                            ></textarea>
                          </div>
                          <div className="logo_image">
                            <div className="a_flex">
                              <img
                                src={logo}
                                alt="store logo"
                                className="logo"
                              />
                              <span>
                                <label htmlFor="file">
                                  <PublishIcon
                                    className="userUpdateIcon upload-btn"
                                    onChange={uploadFileHandler}
                                  />
                                </label>
                                <input
                                  onChange={uploadFileHandler}
                                  type="file"
                                  id="file"
                                  style={{ display: "none" }}
                                />
                              </span>
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="store logo url"
                                value={logo}
                                className="logo_url"
                                onChange={(e) => setLogo(e.target.value)}
                              />
                            </div>
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
