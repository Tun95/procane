import React, { useContext } from "react";
import "../styles/styles.scss";
import parse from "html-react-parser";
import LoadingBox from "../../utilities/message loading/LoadingBox";
import MessageBox from "../../utilities/message loading/MessageBox";
import { Context } from "../../../context/Context";

function Careers() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { loading, error, settings } = state;
  window.scrollTo(0, 0);
  return (
    <div className="container info_form">
      <div className="product mtb">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <div className="content">
            {settings?.map((s, index) => (
              <div className="about-section-block" key={index}>
                {parse(`<p>${s?.careers}</p>`)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Careers;
