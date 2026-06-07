import { Link } from "react-router-dom";
import "./OffersSection.css";
import arrowImg from "../../assets/images/Arrow.png";

export default function OffersSection() {
  return (
    <section className="offers-section">
      <h2 className="offers-title">Що ми пропонуємо?</h2>

      <div className="offers-cards">
        <div className="offer-card">
          <h3 className="offer-card-title">Безкоштовно</h3>
          <ul className="offer-list">
            <li>Доступ до окремих статтей різних напрямлень</li>
            <li>Доступ до ШІ-агента, котрий допоможе знайти потрібний матеріал</li>
            <li>Можливість отримати платні статті за активність</li>
          </ul>
        </div>

        <div className="offer-card">
          <h3 className="offer-card-title">За окрему плату</h3>
          <ul className="offer-list">
            <li>Доступ до спеціалізованих та ексклюзивних статтей</li>
            <li>Можливість обрати тільки те, що потрібно</li>
            <li>Можливість спробувати наш сервіс</li>
          </ul>
        </div>

        <div className="offer-card">
          <h3 className="offer-card-title">За підпискою</h3>
          <ul className="offer-list">
            <li>Доступ до всіх статтей без обмежень (навіть ті, що доступні тимчасово)</li>
            <li>Повний доступ до чату з експертами 24/7</li>
            <li>Ексклюзивні семінари та лекції від професіоналів з різних компаній</li>
          </ul>
        </div>
      </div>

      <div className="offers-cta">
        <span className="offers-cta-text">Долучайся прямо зараз</span>

        <img
          src={arrowImg}
          alt="Arrow"
          className="offers-arrow-img"
        />

        <Link to="/register" className="offers-button">
          Реєстрація
        </Link>
      </div>
    </section>
  );
}
