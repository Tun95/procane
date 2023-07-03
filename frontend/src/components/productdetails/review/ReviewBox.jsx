import React, { useContext, useReducer, useRef, useState } from "react";
import "../styles/styles.scss";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Rating from "../../utilities/rating/Ratings";
import { Context } from "../../../context/Context";
import { toast } from "react-toastify";
import axios from "axios";
import { request } from "../../../base url/BaseUrl";
import { getError } from "../../utilities/util/Utils";
import MessageBox from "../../utilities/message loading/MessageBox";
import LoadingBox from "../../utilities/message loading/LoadingBox";
import { Link } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_PRODUCT":
      return { ...state, product: action.payload, loading: true };
    case "CREATE_REQUEST":
      return { ...state, loadingCreateReview: true, successCreate: false };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreateReview: false, successCreate: true };
    case "CREATE_FAIL":
      return { ...state, loadingCreateReview: false, successCreate: false };

    default:
      return state;
  }
};
function ReviewBox({ product }) {
  const [{ loadingCreateReview }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  //==========
  //CONTEXT
  //==========
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const {
    cart: { cartItems },
    userInfo,
    settings,
  } = state;

  //=============
  //SUBMIT REVIEW
  //=============
  let reviewsRef = useRef();
  const [rating, setRating] = useState(5.0);
  const [comment, setComment] = useState("");

  const submitHandler = async (e, values, actions) => {
    e.preventDefault();
    if (!comment && !rating) {
      toast.error("Please enter a comment and select a rating of your choice", {
        position: "bottom-center",
      });
      return;
    } else {
      if (comment.length < 50) {
        toast.error("Your review must be at least 50 characters", {
          position: "bottom-center",
        });
      } else {
        try {
          const { data } = await axios.post(
            `${request}/api/products/${product._id}/reviews`,
            {
              rating,
              comment,
              image: userInfo.image,
              email: userInfo.email,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
            },
            {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            }
          );

          dispatch({
            type: "CREATE_SUCCESS",
            payload: { seller: data.seller },
          });
          toast.success("Review submitted successfully", {
            position: "bottom-center",
          });

          product.reviews.unshift(data.review);
          product.numReviews = data.numReviews;
          product.rating = data.rating;
          dispatch({ type: "REFRESH_PRODUCT", payload: product });
          window.scrollTo({
            behavior: "smooth",
            top: reviewsRef.current.offsetTop,
          });

          // Refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (err) {
          toast.error(getError(err), { position: "bottom-center" });
          dispatch({ type: "CREATE_FAIL" });
          console.log(err);
        }
      }
    }
    actions?.resetForm();
  };

  const ratings = [
    {
      id: 1,
      rating: 0.5,
    },
    {
      id: 2,
      rating: 1.0,
    },
    {
      id: 3,
      rating: 1.5,
    },
    {
      id: 4,
      rating: 2.0,
    },
    {
      id: 5,
      rating: 2.5,
    },
    {
      id: 6,
      rating: 3.0,
    },
    {
      id: 7,
      rating: 3.5,
    },
    {
      id: 8,
      rating: 4.0,
    },
    {
      id: 9,
      rating: 4.5,
    },
    {
      id: 10,
      rating: 5.0,
    },
  ];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 210,
      },
    },
  };
  return (
    <div className="review_box" id="textBox">
      <div className="form_box">
        <div className="text_editor">
          {userInfo ? (
            <>
              <h4 ref={reviewsRef}>Write Your Reviews</h4>

              <form action="" className="form_input" onSubmit={submitHandler}>
                <div className="select_input">
                  <FormControl variant="filled" size="small" id="formControl">
                    <Select
                      labelId="mui-simple-select-label"
                      id="mui-simple-select"
                      className="select_mui"
                      value={rating}
                      label={rating}
                      disableUnderline={true}
                      SelectDisplayProps={{
                        style: { paddingTop: 8, paddingBottom: 8 },
                      }}
                      MenuProps={MenuProps}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      {ratings?.map((r, index) => (
                        <MenuItem
                          className="c_flex"
                          id="menu_item"
                          key={index}
                          value={r.rating}
                        >
                          <span className="rate">
                            <Rating rating={r.rating} />
                          </span>
                          <small className="">({r.rating})</small>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="text_area">
                  <textarea
                    name="text"
                    className="write_reviews"
                    placeholder="Your Message"
                    id="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="submit_btn">
                  <button disabled={loadingCreateReview}>Submit</button>
                  {loadingCreateReview && <LoadingBox></LoadingBox>}
                </div>
              </form>
            </>
          ) : (
            <div className="message-box">
              <MessageBox>
                Please{" "}
                <Link to={`/login?redirect=/product/${product.slug}`}>
                  Log In
                </Link>{" "}
                to write a review
              </MessageBox>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewBox;
