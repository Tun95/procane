import React, { useEffect } from "react";
import "./styles.scss";
import show from "../../../assets/show/show.png";
import show1 from "../../../assets/show/show1.jpg";
import { Bounce } from "react-awesome-reveal";

function typeWriterEffect(element, text, speed) {
  let i = 0;
  const typeWriter = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  };
  typeWriter();
}

function Annct() {
  useEffect(() => {
    const pElement = document.getElementById("typewriter-p");
    const statements = [
      "Explore the vastness of our store",
      "Discover the latest collections",
      "Shop with confidence",
      "Experience unparalleled quality",
      "Find your perfect style",
    ];
    let currentStatementIndex = 0;

    const typeNextStatement = () => {
      const currentStatement = statements[currentStatementIndex];
      pElement.textContent = ""; // Clear previous text before typing new statement
      typeWriterEffect(pElement, currentStatement, 50);
      currentStatementIndex = (currentStatementIndex + 1) % statements.length;
    };

    const typingInterval = setInterval(typeNextStatement, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <>
      <section className="annocument background">
        <div className="container d_flex display_grid">
          <div className="img img-1">
            <span className="explore l_flex">
              <Bounce cascade damping={0.2} duration={3000}>
                <h2>Want More!</h2>
              </Bounce>
            </span>
            <img src={show} width="100%" height="100%" alt="" />
          </div>
          <div className="img img-2">
            <span className="explore l_flex">
              <h2>Our Show Room</h2>
              <p id="typewriter-p">Explore the vastness of our store</p>
            </span>
            <img src={show1} width="100%" height="100%" alt="" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Annct;
