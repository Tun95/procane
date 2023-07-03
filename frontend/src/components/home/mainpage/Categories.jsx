import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Context } from "../../../context/Context";
import { Link } from "react-router-dom";

function Categories() {
  const { t } = useTranslation(); // Initialize the translation hook
  const { state } = useContext(Context);
  const { categories } = state;

  return (
    <>
      <div className="category category-filter">
        {categories?.map((c, index) => (
          <div className="box" key={index}>
            <Link to={`/store?category=${c.category}`} className="a_flex">
              <img src={c.categoryImg} alt="" />
              <span>{t(c.category)}</span>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default Categories;
