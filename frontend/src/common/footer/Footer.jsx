import React, { useContext } from "react";
import "./footer.scss";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { Fade } from "react-awesome-reveal";
import paypal from "../../assets/smallpaypal.png";
import stripe from "../../assets/smallstripe.png";
import razor from "../../assets/smallrazor.jpeg";
import paystack from "../../assets/smallpaystack.png";

function Footer() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings, userInfo } = state;
  const { storeAddress, email, whatsapp } =
    (settings &&
      settings
        .map((s) => ({
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
            <div className="box float">
              <h4>My Account</h4>
              <ul>
                {userInfo ? (
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <li>
                      <Link to={`/user-profile/${userInfo._id}`}>
                        My profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/track-order">Orders</Link>
                    </li>
                    <li>
                      <Link to={`/wish-list/${userInfo._id}`}>Wishlist</Link>
                    </li>
                  </Fade>
                ) : (
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <li>
                      <Link to="/login">Login</Link>
                    </li>
                    <li>
                      <Link to="/register">Create account</Link>
                    </li>
                  </Fade>
                )}
              </ul>
            </div>

            <div className="box float">
              <h4>About Us</h4>
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
              <h4>Customer Care</h4>
              <ul>
                <Fade cascade direction="down" triggerOnce damping={0.4}>
                  <li>
                    <Link to="/contact">Help Center </Link>
                  </li>
                  <li>
                    <Link to="/how-to-buy">How to Buy </Link>
                  </li>
                  <li>
                    <Link to="/track-shipment">Track Your Order </Link>
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
              <h4>Contact Us</h4>
              <ul>
                <Fade direction="down" triggerOnce damping={0.4}>
                  <li>{storeAddress}</li>
                </Fade>
                <div>
                  <Fade cascade direction="down" triggerOnce damping={0.4}>
                    <li>
                      Email:{" "}
                      <a href={`mailto:${email}`} className="email">
                        {email}
                      </a>
                    </li>
                    <li>
                      Phone: <a href={`tel:${whatsapp}`}>{whatsapp}</a>
                    </li>{" "}
                  </Fade>
                </div>{" "}
              </ul>
            </div>
          </div>
          <div className="footer_base c_flex">
            <div className="since">
              <p>© 2023 Mernstore | Powered by MERN Stack</p>
            </div>
            <div className="payment_gateway">
              <img src={paypal} alt="" className="img" />
              <img src={stripe} alt="" className="img" />
              <img src={paystack} alt="" className="img" />
              <img src={razor} alt="" className="img" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
