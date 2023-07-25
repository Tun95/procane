import React from "react";
import "./styles.css";
import { Fade } from "react-awesome-reveal";

function Wrapper() {
  const data = [
    {
      cover: <i className="fa-solid fa-truck-fast"></i>,
      title: "Worldwide Delivery",
      decs: "From parcels to packages, we connect the globe, bridging distances with swift and reliable shipping services, bringing the world closer together.",
    },
    {
      cover: <i className="fa-solid fa-id-card"></i>,
      title: "Safe Payment",
      decs: "Protecting your transactions with advanced security measures, we ensure your financial information is safeguarded, providing peace of mind for worry-free transactions.",
    },
    {
      cover: <i className="fa-solid fa-shield"></i>,
      title: "Shop With Confidence ",
      decs: "Explore a vast selection of trusted products, backed by reliable customer reviews and hassle-free returns, empowering you to make informed and satisfying purchasing decisions.",
    },
    {
      cover: <i className="fa-solid fa-headset"></i>,
      title: "24/7 Support ",
      decs: "Our dedicated team is always available, around the clock, to assist you with any inquiries or concerns, providing timely and reliable assistance whenever you need it.",
    },
  ];
  return (
    <>
      <section className="wrapper background">
        <div className="container wrapper-grid">
          {data?.map((item, index) => {
            return (
              <div className="product" key={index}>
                <Fade cascade direction="down" triggerOnce damping={0.4}>
                  <div className="img icon-circle">
                    <i>{item.cover}</i>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.decs}</p>
                </Fade>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default Wrapper;
