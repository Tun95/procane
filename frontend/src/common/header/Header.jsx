import React from "react";
import Head from "./Head";
import Search from "./Search";
import Navbar from "./Navbar";
import "./header.css";

function Header() {
  return (
    <>
      <Head />
      <Search />
      <Navbar />
    </>
  );
}

export default Header;
