import React, { useEffect, useReducer, useState } from "react";
import "./styles.scss";
import show from "../../../assets/show/show.png";
import show1 from "../../../assets/show/show1.jpg";
import { Bounce } from "react-awesome-reveal";
import { request } from "../../../base url/BaseUrl";
import axios from "axios";
import { getError } from "../../utilities/util/Utils";
import MessageBox from "../../utilities/message loading/MessageBox";
import LoadingBox from "../../utilities/message loading/LoadingBox";

function typeWriterEffect(text, speed, onCharacterTyped) {
  let i = 0;
  const typeWriter = () => {
    if (i < text.length) {
      onCharacterTyped(text.charAt(i));
      i++;
      setTimeout(typeWriter, speed);
    }
  };
  typeWriter();
}

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, showRooms: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Annct() {
  const [{ loading, error, showRooms }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    showRooms: [],
  });

  const [typewriterText, setTypewriterText] = useState("");

  //===============
  //FETCH ALL BRANDS
  //===============
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/showroom`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Check if showRooms is not undefined and has data before using it
    if (showRooms?.length > 0) {
      const statements = showRooms[0].normalText;
      let currentStatementIndex = 0;

      const typeNextStatement = () => {
        const currentStatement = statements[currentStatementIndex];
        let typedText = "";
        typeWriterEffect(currentStatement, 50, (character) => {
          typedText += character;
          setTypewriterText(typedText);
        });
        currentStatementIndex = (currentStatementIndex + 1) % statements.length;
      };

      const typingInterval = setInterval(typeNextStatement, 3000);

      // Clean up the interval when the component unmounts
      return () => clearInterval(typingInterval);
    }
  }, [showRooms]);

  // Check if the data is still loading
  if (loading) {
    return (
      <div>
        <LoadingBox />
      </div>
    );
  }

  // Check for errors during data fetching
  if (error) {
    return (
      <div>
        <MessageBox>{error}</MessageBox>
      </div>
    );
  }

  // Check if there are no showRooms data
  if (showRooms.length === 0) {
    return <MessageBox>No data found.</MessageBox>;
  }

  const { titleOne, titleTwo, largeImage, smallImage } = showRooms[0];

  return (
    <>
      <section className="annocument background">
        <div className="container d_flex display_grid">
          <div className="img img-1">
            <span className="explore l_flex">
              <Bounce cascade damping={0.2} duration={3000}>
                <h2>{titleOne}</h2>
              </Bounce>
            </span>
            {smallImage && (
              <img src={smallImage} width="100%" height="100%" alt="" />
            )}
          </div>
          <div className="img img-2">
            <span className="explore l_flex">
              <h2>{titleTwo}</h2>
              <p>{typewriterText}</p>
            </span>
            {largeImage && (
              <img src={largeImage} width="100%" height="100%" alt="" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Annct;
