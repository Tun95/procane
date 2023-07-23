import React, { useState } from "react";
import Rating from "../../utilities/rating/Ratings";
import ReviewBox from "./ReviewBox";
import MessageBox from "../../utilities/message loading/MessageBox";
import ReactTimeAgo from "react-time-ago";
import parse from "html-react-parser";
import me from "../../../assets/me.png";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled, alpha } from "@mui/material/styles";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 100,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      margin: "5px 0px",
      fontSize: "15px",
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        //  backgroundColor: alpha(
        //     theme.palette.primary.main,
        //     theme.palette.action.selectedOpacity
        //   ),
      },
    },
  },
}));
function ReviewDesc({ product, userInfo, handleDelete }) {
  //=== Review ==//
  const [review, setReview] = useState(false);
  const closeReview = () => {
    setReview(false);
    document.body.style.overflow = "unset";
  };
  const showReview = () => {
    setReview(true);
  };
  const ReviewDetail = () => {
    showReview();
    closeDescription();
  };

  // ===Description===//
  const [description, setDescription] = useState(true);
  const closeDescription = () => {
    setDescription(false);
    document.body.style.overflow = "unset";
  };
  const showDescription = () => {
    setDescription(true);
  };
  const DescriptionDetail = () => {
    showDescription();
    closeReview();
  };

  // ==== REVIEW DRAWER ====//
  const [anchorUsr, setAnchorUsr] = useState(null);
  const openUsr = Boolean(anchorUsr);
  const handleClickUsr = (event) => {
    setAnchorUsr(event.currentTarget);
  };
  const handleCloseUsr = () => {
    setAnchorUsr(null);
  };

  return (
    <>
      <section className=" background review-section ">
        <div className="rev ">
          <div className="rev-style">
            <div className="rev-head c_flex">
              <div className="d_flex rev_desc">
                <button
                  onClick={DescriptionDetail}
                  className={description === true ? "active" : ""}
                >
                  Descriptions
                </button>
                <button
                  onClick={ReviewDetail}
                  className={review === true ? "active" : ""}
                >
                  Reviews <span>({product.numReviews})</span>
                </button>
              </div>
              <div>
                {userInfo ? (
                  <button className="write_review" onClick={ReviewDetail}>
                    <a href="#textBox">Write a review</a>
                  </button>
                ) : null}
              </div>
            </div>

            {review && (
              <>
                <div className="noreviews">
                  {product?.reviews?.length === 0 && (
                    <MessageBox>There is no review</MessageBox>
                  )}
                </div>
                {product.reviews?.map((review, index) => (
                  <div className="review-details" key={index}>
                    <div className="rev-header c_flex">
                      <div className="a_flex">
                        <div className="img">
                          <img src={review.image ? review.image : me} alt="" />
                        </div>
                        <div className="name-stars ">
                          <div className="name">
                            {review.lastName} {review.firstName}
                          </div>
                          <div className="rate c_flex">
                            <Rating rating={review.rating} />
                            <small className="rate_num">
                              ({review.rating})
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="date a_flex">
                        {userInfo && userInfo.email === review.email ? (
                          <span>
                            <MoreVertIcon
                              onClick={handleClickUsr}
                              className="mui_icon"
                            />
                            <StyledMenu
                              id="demo-customized-menu"
                              MenuListProps={{
                                "aria-labelledby": "demo-customized-button",
                              }}
                              anchorEl={anchorUsr}
                              open={openUsr}
                              onClose={handleCloseUsr}
                            >
                              {/* <MenuItem onClick={handleCloseUsr} disableRipple>
                              <EditNoteIcon />
                              Edit
                            </MenuItem> */}
                              <MenuItem
                                // onClick={() => handleCloseUsr}
                                onClick={() => handleDelete(review._id)}
                                disableRipple
                              >
                                <DeleteForeverIcon />
                                Delete
                              </MenuItem>
                            </StyledMenu>
                          </span>
                        ) : null}
                        <ReactTimeAgo
                          date={Date.parse(review.createdAt)}
                          locale="en-US"
                        />
                      </div>
                    </div>
                    <div className="comment">
                      <p>{review.comment}</p>
                    </div>
                    {/* <div className="like">
                      <button className="reply_btn">Reply</button>
                    </div> */}
                  </div>
                ))}
                <div className="review-details">
                  <ReviewBox product={product} />
                </div>
              </>
            )}
            {description && (
              <div className="discriptions review-details">
                <p className="mtb">{parse(`<p>${product.desc}</p>`)} </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ReviewDesc;
