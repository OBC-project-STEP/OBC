import { Link } from "react-router-dom";
import "./ExpertsCTA.css";

export default function ExpertsCTA() {
  return (
    <section className="experts-cta">
      <div className="experts-cta-inner">

        <div className="experts-cta-card">
          <h2>Готові отримати консультацію?</h2>
          <p>
            Оформлюйте підписку, щоб отримати повний доступ до чату з нашими
            найкращими експертами в режимі 24/7.
          </p>
          <Link to="/register" className="experts-cta-button">
            Реєстрація
          </Link>
        </div>

        <div className="experts-cta-card">
          <h2>Ви експерт у своїй галузі?</h2>
          <p>
            Приєднуйтесь до нашої команди, діліться знаннями та отримуйте
            додатковий дохід.
          </p>
          <button className="experts-cta-button">Зконтактуйте нас</button>
        </div>

      </div>
    </section>
  );
}
