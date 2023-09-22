import React from "react";
import Category from "../../list/fiters/category/Category";
import Brands from "../../list/fiters/brand/Brand";
import Colors from "../../list/fiters/color/Colors";
import Sizes from "../../list/fiters/size/Sizes";
import Banners from "../../list/banner/Banners";

function Filters() {
  return (
    <div>
      <Category />
      <Brands />
      <Colors />
      <Sizes />
      <Banners />
    </div>
  );
}

export default Filters;
