import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Context } from "../../../context/Context";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

function Categories() {
  const navigate = useNavigate();

  const { t } = useTranslation(); // Initialize the translation hook
  const { state } = useContext(Context);
  const { categories } = state;

  return (
    <>
      <div className="category category-filter">
        {categories?.map((c, index) => (
          <div className="box" key={index}>
            <a href="#store">
              <button
                onClick={() => navigate(`/store?category=${c.category}`)}
                className="a_flex view_all"
              >
                <img src={c.categoryImg} alt="" />
                <span>{t(c.category)}</span>
              </button>
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

export default Categories;
