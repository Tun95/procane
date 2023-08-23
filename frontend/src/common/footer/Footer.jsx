import React, { useContext } from "react";
import "./footer.scss";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { Fade } from "react-awesome-reveal";

function Footer() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings } = state;
  const {
    storeAddress,
    webname,
    shortDesc,
    playstore,
    appstore,
    email,
    whatsapp,
  } =
    (settings &&
      settings
        .map((s) => ({
          webname: s.webname,
          shortDesc: s.shortDesc,
          playstore: s.playstore,
          appstore: s.appstore,
          storeAddress: s.storeAddress,
          whatsapp: s.whatsapp,
          email: s.email,
        }))
        .find(() => true)) ||
    {};
  return (
    <>
      <footer>
        <div className="container ">
          <div className="grid2 footer-wrap">
            <div className="box">
              <h1>{webname}</h1>
              <p className="short_desc">{shortDesc}</p>
              <div className="">
                <span className="icon d_flex">
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <a
                      href={`${playstore}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="img a_flex"
                    >
                      <i className="fa-brands fa-google-play"></i>
                      <span>Google Play</span>
                    </a>
                    <a
                      href={`${appstore}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="img a_flex app-store"
                    >
                      <i className="fa-brands fa-app-store-ios"></i>
                      <span>App Store</span>
                    </a>
                  </Fade>
                </span>
              </div>
              <hr className="horizontal" />
            </div>

            <div className="box float">
              <h2>About Us</h2>
              <ul>
                <Fade cascade direction="down" triggerOnce damping={0.4}>
                  <li>
                    <Link to="/careers"> Careers</Link>
                  </li>
                  <li>
                    <Link to="/store-locations">Our Stores</Link>
                  </li>
                  <li>
                    <Link to="/our-cares">Our Cares</Link>
                  </li>
                  <li>
                    <Link to="/terms-and-conditons">Terms & Conditions</Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </li>
                </Fade>
              </ul>
            </div>
            <div className="box float">
              <h2>Customer Care</h2>
              <ul>
                <Fade cascade direction="down" triggerOnce damping={0.4}>
                  <li>
                    <Link to="/contact">Help Center </Link>
                  </li>
                  <li>
                    <Link to="/how-to-buy">How to Buy </Link>
                  </li>
                  <li>
                    <Link to="/track-order">Track Your Order </Link>
                  </li>
                  <li>
                    <Link to="/bulk-purchases">
                      Corporate & Bulk Purchasing{" "}
                    </Link>
                  </li>
                  <li>
                    <Link to="/returns">Returns & Refunds </Link>
                  </li>
                </Fade>
              </ul>
            </div>
            <div className="box float">
              <h2>Contact Us</h2>
              <ul>
                <Fade direction="down" triggerOnce damping={0.4}>
                  <li>{storeAddress}</li>
                </Fade>
                <div>
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <li>
                      Email: <a href={`mailto:${email}`}>{email}</a>
                    </li>
                    <li>
                      Phone: <a href={`tel:${whatsapp}`}>{whatsapp}</a>
                    </li>{" "}
                  </Fade>
                </div>{" "}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
