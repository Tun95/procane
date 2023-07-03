import React from "react";
import cat1 from "../../../assets/images/category/cat-1.png";
import cat2 from "../../../assets/images/category/cat-2.png";
import { useNavigate } from "react-router-dom";

function Catg() {
  const data = [
    {
      cateImg: cat1,
      cateName: "Burrow",
    },
    {
      cateImg: cat2,
      cateName: "Joybird",
    },
    {
      cateImg: cat1,
      cateName: "Asley",
    },
    {
      cateImg: cat2,
      cateName: "Blue dot",
    },
    {
      cateImg: cat1,
      cateName: "Allform",
    },
    {
      cateImg: cat2,
      cateName: "Apt2B",
    },
  ];

  const navigate = useNavigate();
  return (
    <>
      <div className="category shop-filter">
        <div className="chead d_flex">
          <h1>Brands</h1>
          <h1>Shops</h1>
        </div>
        {data?.map((item, index) => (
          <div className="box f_flex" key={index}>
            <img src={item.cateImg} alt="" />
            <span>{item.cateName}</span>
          </div>
        ))}
        <div className="box box2">
          <button onClick={() => navigate("/store")}>View All Brandes</button>
        </div>
      </div>
    </>
  );
}

export default Catg;
