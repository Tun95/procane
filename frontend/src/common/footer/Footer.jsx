import React, { useContext } from "react";
import "./footer.css";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";

function Footer() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings } = state;
  return (
    <>
      <footer>
        <div className="container grid2 footer-wrap">
          <div className="box">
            <h1>ProCanes</h1>
            <p>
              To synthesize world-class quality furniturethat fits amidst
              everydesigner setting andsymbolizes serenity inevery home. Welcome
              to the worldof outdoors and indoors
            </p>
            <div className="">
              {settings?.map((s, index) => (
                <span className="icon d_flex" key={index}>
                  <a
                    href={`${s.playstore}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="img a_flex"
                  >
                    <i className="fa-brands fa-google-play"></i>
                    <span>Google Play</span>
                  </a>
                  <a
                    href={`${s.appstore}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="img a_flex app-store"
                  >
                    <i className="fa-brands fa-app-store-ios"></i>
                    <span>App Store</span>
                  </a>
                </span>
              ))}
            </div>
          </div>

          <div className="box">
            <h2>About Us</h2>
            <ul>
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
            </ul>
          </div>
          <div className="box">
            <h2>Customer Care</h2>
            <ul>
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
                <Link to="/bulk-purchases">Corporate & Bulk Purchasing </Link>
              </li>
              <li>
                <Link to="/returns">Returns & Refunds </Link>
              </li>
            </ul>
          </div>
          <div className="box">
            <h2>Contact Us</h2>
            <ul>
              <li>G-138, Sector 63, Noida-201301</li>
              {settings?.map((s, index) => (
                <div key={index}>
                  <li>
                    Email: <a href={`mailto:${s.email}`}>{s.email}</a>
                  </li>
                  <li>
                    Phone: <a href={`tel:${s.whatsapp}`}>{s.whatsapp}</a>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
