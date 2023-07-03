import React from "react";
import Head from "./Head";
import Search from "./Search";
import Navbar from "./Navbar";
import "./header.css";

function Header() {
  return (
    <div>
      <Head />
      <Search />
      <Navbar />
    </div>
  );
}

export default Header;
