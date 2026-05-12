import { Link } from "react-router-dom";
import "./AboutUs.css";
import arrowImg from "../../assets/images/Arrow.png";

export default function AboutCTA() {
  return (
    <section className="about-cta">
      <div className="about-cta-inner">
        <span className="about-cta-text">Долучайся прямо зараз</span>

        <img
          src={arrowImg}
          alt="Arrow"
          className="about-cta-arrow-img"
        />

        <Link to="/register" className="about-cta-button">
          Реєстрація
        </Link>
      </div>
    </section>
  );
}
