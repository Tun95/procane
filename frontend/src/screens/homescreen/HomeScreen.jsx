import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import Annct from "../../components/home/announcement/Annct";
import Discount from "../../components/home/discount/Discount";
import FlashDeals from "../../components/home/flashdeals/FlashDeals";
import Home from "../../components/home/mainpage/Home";
import NewArrival from "../../components/home/newArrival/NewArrival";
import Shop from "../../components/home/shop/Shop";
import TopCate from "../../components/home/top/TopCate";
import Wrapper from "../../components/home/wrapper/Wrapper";
import "./styles.scss";
import Subscribe from "../../components/home/subscribe/Subscribe";
import { Context } from "../../context/Context";
import LoadingBox from "../../components/utilities/message loading/LoadingBox";
import MessageBox from "../../components/utilities/message loading/MessageBox";

function HomeScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Context);
  const { loading, error } = state;
  // window.scrollTo(0, 0);

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div className="home_outline">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <Home />
            <FlashDeals />
            <TopCate />
            <NewArrival />
            <Discount />
            <Shop />

            <Annct />
            <Wrapper />
            <Subscribe />
          </>
        )}
      </div>
    </>
  );
}

export default HomeScreen;
