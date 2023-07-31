import React from "react";
import ShowRoom from "../show room/ShowRoom";
import "./styles.scss";
import WrapperForm from "../wrapper/Wrappers";

function Home() {
  return (
    <div className="home_settings">
      <div className="f_flex">
        <span className="show_room_home">
          <ShowRoom />
        </span>
        <span className="wrapper">
          <WrapperForm />
        </span>
      </div>
    </div>
  );
}

export default Home;
