import { Link } from "react-router-dom";
import "./Knowledge.css";
import bannerBg from "../../assets/images/Banner-background.png";

export default function AccessCTA() {
  return (
    <section
      className="access-cta"
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      <div className="access-cta-inner">
        <h2 className="access-cta-title">
          Хочете отримати повний доступ?
        </h2>

        <p className="access-cta-text">
          Зареєструйтесь, щоб читати всі безкоштовні статті без обмежень,
          зберігати матеріали та користуватися допомогою нашого ШІ-асистента.
          Це швидко і безкоштовно.
        </p>

        <Link to="/register" className="access-cta-button">
          Реєстрація
        </Link>
      </div>
    </section>
  );
}
