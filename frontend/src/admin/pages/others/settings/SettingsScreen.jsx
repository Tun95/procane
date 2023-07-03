import React, { useContext } from "react";
import dude from "../../../assets/settings.png";
import "./styles.scss";
import { Context } from "../../../../context/Context";
import { Link } from "react-router-dom";

function SettingsScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { settings } = state;

  return (
    <div className="settings_screen">
      <div className="settings_box p_flex">
        <span className="a_flex">
          <img src={dude} alt="" className="dude" />
          {settings?.map((s, index) => (
            <Link
              to={`/admin/settings/${s._id}`}
              className="link_btn l_flex"
              key={index}
            >
              Go to Settings
            </Link>
          ))}
        </span>
      </div>
    </div>
  );
}

export default SettingsScreen;
